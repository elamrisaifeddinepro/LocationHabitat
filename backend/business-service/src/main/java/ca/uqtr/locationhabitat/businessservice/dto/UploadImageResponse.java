package ca.uqtr.locationhabitat.businessservice.dto;

public class UploadImageResponse {

    private String fileName;
    private String url;

    public UploadImageResponse() {
    }

    public UploadImageResponse(String fileName, String url) {
        this.fileName = fileName;
        this.url = url;
    }

    public String getFileName() {
        return fileName;
    }

    public String getUrl() {
        return url;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}