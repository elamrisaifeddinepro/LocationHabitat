import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { SILENT_HTTP_ERROR } from '../interceptors/http-error.interceptor';

export interface GeocodingResult {
  lat: number;
  lng: number;
}

export interface GeocodingResponse {
  result: GeocodingResult | null;
  quality: 'exact' | 'approx' | 'vague';
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly cacheBasic = new Map<string, Observable<GeocodingResult | null>>();
  private readonly cacheDetailed = new Map<string, Observable<GeocodingResponse>>();

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<GeocodingResult | null> {
    const key = this.normalize(address);
    if (!key) return of(null);

    const cached = this.cacheBasic.get(key);
    if (cached) return cached;

    const params: any = {
      q: key,
      format: 'jsonv2',
      limit: '10',
      addressdetails: '1',
      dedupe: '1'
    };

    const ctx = new HttpContext().set(SILENT_HTTP_ERROR, true);

    const request$ = this.http.get<any[]>(this.nominatimUrl, { params, context: ctx }).pipe(
      map(results => {
        if (!results || results.length === 0) return null;
        const best = this.pickBestResult(results);
        const lat = parseFloat(best.lat);
        const lng = parseFloat(best.lon);
        return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
      }),
      catchError((error) => {
        console.error('Geocoding error:', error);
        return of(null);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cacheBasic.set(key, request$);
    return request$;
  }

  geocodeAddressDetailed(address: string): Observable<GeocodingResponse> {
    const key = this.normalize(address);
    if (!key) return of({ result: null, quality: 'vague' });

    const cached = this.cacheDetailed.get(key);
    if (cached) return cached;

    const params: any = {
      q: key,
      format: 'jsonv2',
      limit: '10',
      addressdetails: '1',
      dedupe: '1'
    };

    const ctx = new HttpContext().set(SILENT_HTTP_ERROR, true);

    const request$ = this.http.get<any[]>(this.nominatimUrl, { params, context: ctx }).pipe(
      map(results => {
        if (!results || results.length === 0) return { result: null, quality: 'vague' as const };

        const best = this.pickBestResult(results);
        const lat = parseFloat(best.lat);
        const lng = parseFloat(best.lon);
        if (isNaN(lat) || isNaN(lng)) return { result: null, quality: 'vague' as const };

        const bboxScore = this.boundingBoxPrecisionScore(best.boundingbox);
        const type = String(best.type ?? '').toLowerCase();
        const isGeneric = ['city', 'town', 'village', 'county', 'state', 'country'].includes(type);

        const quality: GeocodingResponse['quality'] =
          (bboxScore >= 2 && !isGeneric) ? 'exact'
          : (bboxScore === 1 && !isGeneric) ? 'approx'
          : 'vague';

        return {
          result: { lat, lng },
          quality,
          displayName: best.display_name
        };
      }),
      catchError((error) => {
        console.error('Geocoding error:', error);
        return of({ result: null, quality: 'vague' as const });
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cacheDetailed.set(key, request$);
    return request$;
  }

  private normalize(address: string): string {
    return (address ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private pickBestResult(results: any[]): any {
    const score = (r: any) => {
      const a = r?.address ?? {};
      const hasHouseNumber = !!a.house_number;
      const hasRoad = !!a.road || !!a.pedestrian || !!a.footway;
      const hasPostcode = !!a.postcode;

      const type = String(r?.type ?? '').toLowerCase();
      const isPreciseType = ['house', 'building', 'residential', 'address', 'road'].includes(type);
      const isTooGenericType = ['city', 'town', 'village', 'county', 'state', 'country'].includes(type);

      const bboxScore = this.boundingBoxPrecisionScore(r?.boundingbox);

      let s = 0;
      s += hasHouseNumber ? 8 : 0;
      s += hasRoad ? 3 : 0;
      s += hasPostcode ? 2 : 0;
      s += isPreciseType ? 2 : 0;
      s -= isTooGenericType ? 6 : 0;
      s += bboxScore;
      return s;
    };

    return [...results].sort((x, y) => score(y) - score(x))[0];
  }

  private boundingBoxPrecisionScore(bbox: any): number {
    if (!bbox || bbox.length !== 4) return 0;

    const south = parseFloat(bbox[0]);
    const north = parseFloat(bbox[1]);
    const west = parseFloat(bbox[2]);
    const east = parseFloat(bbox[3]);

    if ([south, north, west, east].some(n => Number.isNaN(n))) return 0;

    const latSpan = Math.abs(north - south);
    const lonSpan = Math.abs(east - west);
    const span = latSpan + lonSpan;

    if (span < 0.002) return 3;
    if (span < 0.02) return 2;
    if (span < 0.2) return 1;
    return 0;
  }
}