package ca.uqtr.locationhabitat.businessservice.controller;

import ca.uqtr.locationhabitat.businessservice.dto.UploadImageResponse;
import ca.uqtr.locationhabitat.businessservice.service.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/images")
    public ResponseEntity<List<UploadImageResponse>> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        List<UploadImageResponse> uploaded = files.stream()
                .map(fileUploadService::storeImage)
                .toList();

        return ResponseEntity.ok(uploaded);
    }
}