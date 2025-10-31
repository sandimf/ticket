package model


// OrderItem adalah model untuk tabel 'order_items' (junction table)
type OrderItem struct {
	ID           uint `gorm:"primarykey" json:"id"`
	OrderID      uint `gorm:"not null" json:"order_id"`
	TicketTypeID uint `gorm:"not null" json:"ticket_type_id"`
	Quantity     int  `gorm:"not null" json:"quantity"`
	// Snapshot harga saat pembelian
	PricePerItem int64 `gorm:"not null" json:"price_per_item"`

	// Relasi
	Order         Order          `gorm:"foreignKey:OrderID" json:"-"`
	TicketType    TicketType     `gorm:"foreignKey:TicketTypeID" json:"ticket_type,omitempty"`
	IssuedTickets []IssuedTicket `gorm:"foreignKey:OrderItemID" json:"issued_tickets,omitempty"`
}