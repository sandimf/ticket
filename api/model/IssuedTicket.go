package model

import (
	"time"
)

// IssuedTicket adalah model untuk tabel 'issued_tickets' (tiket individual)
type IssuedTicket struct {
	ID            uint   `gorm:"primarykey" json:"id"`
	OrderItemID   uint   `gorm:"not null" json:"order_item_id"`
	AttendeeName  string `gorm:"size:255;not null" json:"attendee_name"`
	AttendeeEmail string `gorm:"size:255" json:"attendee_email"`
	TicketCode    string `gorm:"size:100;unique;not null" json:"ticket_code"` // Kode unik untuk QR/Barcode
	CheckedIn     bool   `gorm:"default:false" json:"checked_in"`
	// Menggunakan pointer *time.Time agar bisa bernilai 'null' jika belum check-in
	CheckInDateTime *time.Time `json:"check_in_datetime,omitempty"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relasi
	OrderItem OrderItem `gorm:"foreignKey:OrderItemID" json:"-"`
}
