package ca.uqtr.locationhabitat.businessservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CreateAnnouncementRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description courte est obligatoire")
    private String shortDescription;

    @NotBlank(message = "La description longue est obligatoire")
    private String longDescription;

    private LocalDate availableDate;

    private List<String> photos;

    @NotBlank(message = "La ville est obligatoire")
    private String city;

    @NotBlank(message = "L'adresse est obligatoire")
    private String address;

    @NotNull(message = "Le loyer mensuel est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le loyer mensuel doit être supérieur à 0")
    private BigDecimal monthlyRent;

    @NotNull(message = "Le nombre de pièces est obligatoire")
    @Min(value = 1, message = "Le nombre de pièces doit être au moins 1")
    private Integer numberOfRooms;

    @NotNull(message = "La surface est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "La surface doit être supérieure à 0")
    private Double area;

    public CreateAnnouncementRequest() {
    }

    public String getTitle() {
        return title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getLongDescription() {
        return longDescription;
    }

    public LocalDate getAvailableDate() {
        return availableDate;
    }

    public List<String> getPhotos() {
        return photos;
    }

    public String getCity() {
        return city;
    }

    public String getAddress() {
        return address;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public Integer getNumberOfRooms() {
        return numberOfRooms;
    }

    public Double getArea() {
        return area;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public void setLongDescription(String longDescription) {
        this.longDescription = longDescription;
    }

    public void setAvailableDate(LocalDate availableDate) {
        this.availableDate = availableDate;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setMonthlyRent(BigDecimal monthlyRent) {
        this.monthlyRent = monthlyRent;
    }

    public void setNumberOfRooms(Integer numberOfRooms) {
        this.numberOfRooms = numberOfRooms;
    }

    public void setArea(Double area) {
        this.area = area;
    }
}