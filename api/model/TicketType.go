package model


import (
	"time"
)

// TicketType adalah model untuk tabel 'ticket_types'
type TicketType struct {
	ID          uint   `gorm:"primarykey" json:"id"`
	EventID     uint   `gorm:"not null" json:"event_id"`
	Name        string `gorm:"size:255;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	// Simpan harga dalam unit terkecil (misal: sen/rupiah) untuk menghindari masalah floating point
	Price          int64     `gorm:"not null" json:"price"`
	TotalStock     int       `gorm:"not null" json:"total_stock"`
	SalesStartDate time.Time `json:"sales_start_date"`
	SalesEndDate   time.Time `json:"sales_end_date"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relasi
	Event Event `gorm:"foreignKey:EventID" json:"-"` // json:"-" untuk menghindari data melingkar (circular)
}
