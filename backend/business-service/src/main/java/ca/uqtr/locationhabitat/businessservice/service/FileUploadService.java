package ca.uqtr.locationhabitat.businessservice.service;

import ca.uqtr.locationhabitat.businessservice.dto.UploadImageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8082}")
    private String baseUrl;

    public UploadImageResponse storeImage(MultipartFile file) {
        validateFile(file);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
            String extension = getExtension(originalName);
            String generatedName = UUID.randomUUID() + extension;

            Path target = uploadPath.resolve(generatedName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            String publicUrl = baseUrl + "/uploads/" + generatedName;

            return new UploadImageResponse(generatedName, publicUrl);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lors du stockage de l'image");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier image vide");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Format non supporté. Formats autorisés : JPG, PNG, WEBP"
            );
        }

        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image trop volumineuse (max 5 MB)");
        }
    }

    private String getExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index) : "";
    }
}