package model

import "time"

// Banner represents a marketing banner displayed in the frontend
// ImageURL points to a publicly served file under /uploads
// LinkURL is optional; when present, clicking the banner navigates to this URL
// Order controls display ordering (ascending); Active controls visibility
type Banner struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Title     string    `gorm:"size:255" json:"title"`
	ImageURL  string    `gorm:"size:255;not null" json:"image_url"`
	LinkURL   string    `gorm:"size:255" json:"link_url"`
	Active    bool      `gorm:"default:true" json:"active"`
	Order     int       `gorm:"default:0" json:"order"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}