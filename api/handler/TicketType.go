package handler

import (
	"api-fiber-gorm/database"
	"api-fiber-gorm/model"   

	"github.com/gofiber/fiber/v2"
)

func GetAllTicketTypes(c *fiber.Ctx) error {
	db := database.DB
	var ticketTypes []model.TicketType
	db.Find(&ticketTypes)
	return c.JSON(fiber.Map{"status": "success", "message": "All ticket types", "data": ticketTypes})
}
func GetTicketType(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var ticketType model.TicketType
	db.First(&ticketType, id)
	if ticketType.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No ticket type found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Ticket type found", "data": ticketType})
}
func CreateTicketType(c *fiber.Ctx) error {
	db := database.DB
	ticketType := new(model.TicketType)
	if err := c.BodyParser(ticketType); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create ticket type", "data": err.Error()})
	}
	if ticketType.EventID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "EventID is required", "data": nil})
	}
	db.Create(&ticketType)
	return c.JSON(fiber.Map{"status": "success", "message": "Created ticket type", "data": ticketType})
}
func UpdateTicketType(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var ticketType model.TicketType
	db.First(&ticketType, id)
	if ticketType.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No ticket type found with ID", "data": nil})
	}
	var updateData model.TicketType
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't parse request body", "data": err.Error()})
	}
	ticketType.Name = updateData.Name
	ticketType.Description = updateData.Description
	ticketType.Price = updateData.Price
	ticketType.TotalStock = updateData.TotalStock
	ticketType.SalesStartDate = updateData.SalesStartDate
	ticketType.SalesEndDate = updateData.SalesEndDate
	db.Save(&ticketType)
	return c.JSON(fiber.Map{"status": "success", "message": "Ticket type successfully updated", "data": ticketType})
}
func DeleteTicketType(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var ticketType model.TicketType
	db.First(&ticketType, id)
	if ticketType.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No ticket type found with ID", "data": nil})
	}
	db.Delete(&ticketType)
	return c.JSON(fiber.Map{"status": "success", "message": "Ticket type successfully deleted", "data": nil})
}
func GetTicketTypesForEvent(c *fiber.Ctx) error {
	eventID := c.Params("event_id")
	db := database.DB
	var ticketTypes []model.TicketType
	db.Where("event_id = ?", eventID).Find(&ticketTypes)
	if len(ticketTypes) == 0 {
		return c.JSON(fiber.Map{"status": "success", "message": "No ticket types found for this event", "data": []model.TicketType{}})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Ticket types for event found", "data": ticketTypes})
}