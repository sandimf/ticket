package model

import (
	"time"
)

type Order struct {
	ID     uint `gorm:"primarykey" json:"id"`
	UserID uint `gorm:"not null" json:"user_id"`
	// TotalAmount juga dalam unit terkecil (sen/rupiah)
	TotalAmount   int64     `gorm:"not null" json:"total_amount"`
	PaymentMethod string    `gorm:"size:100" json:"payment_method"`
	PaymentStatus string    `gorm:"size:50;not null;default:'pending'" json:"payment_status"` // 'pending', 'paid', 'failed', 'refunded'
	InvoiceCode   string    `gorm:"size:100;unique;not null" json:"invoice_code"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relasi
	User       User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
}