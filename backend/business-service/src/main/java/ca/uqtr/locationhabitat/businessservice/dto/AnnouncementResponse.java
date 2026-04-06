package ca.uqtr.locationhabitat.businessservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AnnouncementResponse {

    private Long id;
    private String title;
    private String description;
    private String shortDescription;
    private String longDescription;
    private LocalDate availableDate;
    private List<String> photos;
    private String city;
    private String address;
    private BigDecimal monthlyRent;
    private Integer numberOfRooms;
    private Double area;
    private Boolean active;
    private Long viewCount;
    private String ownerAuthUserId;
    private String ownerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AnnouncementResponse() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
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

    public Boolean getActive() {
        return active;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public String getOwnerAuthUserId() {
        return ownerAuthUserId;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public void setActive(Boolean active) {
        this.active = active;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public void setOwnerAuthUserId(String ownerAuthUserId) {
        this.ownerAuthUserId = ownerAuthUserId;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}