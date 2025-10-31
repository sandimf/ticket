package model

import (
	"time"
)

// type User struct {
// 	ID          uint    `gorm:"primaryKey" json:"id"`
// 	Username    string  `gorm:"unique;not null" json:"username"`
// 	FullName    string  `gorm:"not null" json:"full_name"`
// 	Email       string  `gorm:"unique;not null" json:"email"`
// 	PhoneNumber string  `gorm:"unique;not null" json:"phone_number"`
// 	Password    string  `gorm:"not null" json:"password"`
// 	IsVerified  bool    `gorm:"default:false" json:"is_verified"`
// 	Role        string  `gorm:"not null;default:'buyer'" json:"role"`
// 	EventPrefs  string  `json:"event

type User struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	Username    string    `gorm:"size:255;not null;unique" json:"username"`
	FullName    string    `gorm:"size:255;not null" json:"full_name"`
	Email       string    `gorm:"size:255;not null;unique" json:"email"`
	Password    string    `gorm:"size:255;not null" json:"-"` // json:"-" agar tidak pernah dikirim dalam respons
	PhoneNumber string    `gorm:"size:50" json:"phone_number"`
	Role        string    `gorm:"size:50;not null;default:'customer'" json:"role"` // 'customer', 'organizer'
	IsVerified  bool      `gorm:"default:false" json:"is_verified"`
	VerificationToken string `gorm:"size:255" json:"-"`
	VerifiedAt  *time.Time `json:"verified_at"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relasi
	Events []Event `gorm:"foreignKey:OrganizerID" json:"events,omitempty"` // Event yang dia buat
	Orders []Order `gorm:"foreignKey:UserID" json:"orders,omitempty"`      // Order yang dia lakukan
}





