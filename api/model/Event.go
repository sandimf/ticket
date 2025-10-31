package model

import (
	"time"
)


type Event struct {
	ID             uint      `gorm:"primarykey" json:"id"`
	OrganizerID    uint      `gorm:"not null" json:"organizer_id"`
	Title          string    `gorm:"size:255;not null" json:"title"`
	Slug           string    `gorm:"size:255;not null;uniqueIndex" json:"slug"`
	Description    string    `gorm:"type:text" json:"description"`
	Category       string    `gorm:"size:100" json:"category"`
	VenueName      string    `gorm:"size:255" json:"venue_name"`
	Address        string    `gorm:"type:text" json:"address"`
	City           string    `gorm:"size:100" json:"city"`
	StartDateTime  time.Time `gorm:"not null" json:"start_datetime"`
	EndDateTime    time.Time `gorm:"not null" json:"end_datetime"`
	PosterImageURL string    `gorm:"size:255" json:"poster_image_url"`
	Status         string    `gorm:"size:50;not null;default:'draft'" json:"status"` // 'draft', 'published', 'completed', 'cancelled'
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relasi
	Organizer   User         `gorm:"foreignKey:OrganizerID" json:"organizer,omitempty"`
	TicketTypes []TicketType `gorm:"foreignKey:EventID" json:"ticket_types,omitempty"`
}
