package handler

import (
	"api-fiber-gorm/database" 
	"api-fiber-gorm/model"    
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetIssuedTicket mengambil satu tiket unik berdasarkan ID
func GetIssuedTicket(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var ticket model.IssuedTicket
	db.First(&ticket, id)
	if ticket.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No ticket found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Ticket found", "data": ticket})
}

// GetTicketsForOrder mengambil semua tiket yang di-issue untuk order tertentu
func GetTicketsForOrder(c *fiber.Ctx) error {
	orderID := c.Params("order_id")
	db := database.DB
	var tickets []model.IssuedTicket

	// Kita perlu join melalui OrderItems
	db.Joins("JOIN order_items ON order_items.id = issued_tickets.order_item_id").
		Where("order_items.order_id = ?", orderID).
		Find(&tickets)

	return c.JSON(fiber.Map{"status": "success", "message": "Tickets for order found", "data": tickets})
}

// GetTicketsForUser mengambil semua tiket yang dimiliki oleh user tertentu
func GetTicketsForUser(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	db := database.DB
	var tickets []model.IssuedTicket

	// Join lebih dalam: IssuedTicket -> OrderItem -> Order -> User
	db.Joins("JOIN order_items ON order_items.id = issued_tickets.order_item_id").
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Where("orders.user_id = ?", userID).
		Find(&tickets)

	return c.JSON(fiber.Map{"status": "success", "message": "Tickets for user found", "data": tickets})
}

// CheckInTicket (Handler Paling Penting untuk Hari-H)
// Menggunakan TICKET_CODE, bukan ID
func CheckInTicket(c *fiber.Ctx) error {
	ticketCode := c.Params("ticket_code")
	db := database.DB
	var ticket model.IssuedTicket

	db.Where("ticket_code = ?", ticketCode).First(&ticket)

	// Kasus 1: Tiket tidak ada
	if ticket.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Ticket code not valid", "data": nil})
	}

	// Kasus 2: Tiket sudah di-scan
	if ticket.CheckedIn {
		return c.Status(400).JSON(fiber.Map{
			"status": "error", 
			"message": "Ticket already checked in", 
			"data": fiber.Map{
				"attendee_name": ticket.AttendeeName,
				"checked_in_at": ticket.CheckInDateTime,
			},
		})
	}

	// Kasus 3: Sukses check-in
	now := time.Now()
	ticket.CheckedIn = true
	ticket.CheckInDateTime = &now
	db.Save(&ticket)

	return c.JSON(fiber.Map{"status": "success", "message": "Check-in successful", "data": ticket})
}

// DeleteIssuedTicket (Sangat tidak disarankan, lebih baik invalidasi)
func DeleteIssuedTicket(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var ticket model.IssuedTicket
	db.First(&ticket, id)
	if ticket.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No ticket found with ID", "data": nil})
	}
	db.Delete(&ticket)
	return c.JSON(fiber.Map{"status": "success", "message": "Ticket deleted (not recommended)", "data": nil})
}