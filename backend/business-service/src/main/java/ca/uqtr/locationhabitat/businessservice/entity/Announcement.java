package ca.uqtr.locationhabitat.businessservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 500)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String longDescription;

    @Column
    private LocalDate availableDate;

    @Column(columnDefinition = "TEXT")
    private String photoUrls;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyRent;

    @Column(nullable = false)
    private Integer numberOfRooms;

    @Column(nullable = false)
    private Double area;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false)
    private Long viewCount;

    @Column(nullable = false, length = 255)
    private String ownerAuthUserId;

    @Column(nullable = false, length = 255)
    private String ownerEmail;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Announcement() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.active == null) {
            this.active = true;
        }

        if (this.viewCount == null) {
            this.viewCount = 0L;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public String getPhotoUrls() {
        return photoUrls;
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

    public void setPhotoUrls(String photoUrls) {
        this.photoUrls = photoUrls;
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