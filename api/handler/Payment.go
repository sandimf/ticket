package handler

import (
	"fmt"
	"path/filepath"

	"api-fiber-gorm/database"
	"api-fiber-gorm/model"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UploadPaymentProof handles uploading a payment proof image and stores the URL in the Order
func UploadPaymentProof(c *fiber.Ctx) error {
	orderID := c.Params("id")

	// Get file from form (key: payment_proof or file)
	file, err := c.FormFile("payment_proof")
	if err != nil {
		// try alternative key
		file, err = c.FormFile("file")
	}
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payment proof file is required", "data": err.Error()})
	}

	guestName := c.FormValue("full_name")
	guestPhone := c.FormValue("phone_number")

	// Generate unique filename preserving extension
	ext := filepath.Ext(file.Filename)
	uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// Save path under ./uploads/
	savePath := fmt.Sprintf("./uploads/%s", uniqueFileName)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save payment proof", "data": err.Error()})
	}

	// Compute public URL
	fileURL := fmt.Sprintf("/uploads/%s", uniqueFileName)

	// Update order with payment proof URL and guest info
	db := database.DB
	var order model.Order
	if err := db.First(&order, orderID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Order not found", "data": nil})
	}
	order.PaymentProofURL = fileURL
	if guestName != "" {
		order.GuestName = guestName
	}
	if guestPhone != "" {
		order.GuestPhone = guestPhone
	}
	if err := db.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to update order with payment proof", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Payment proof uploaded", "data": order})
}

// UploadPaymentProofByInvoice allows uploading payment proof using invoice code
func UploadPaymentProofByInvoice(c *fiber.Ctx) error {
	invoice := c.Params("invoice")

	// Get file from form (key: payment_proof or file)
	file, err := c.FormFile("payment_proof")
	if err != nil {
		// try alternative key
		file, err = c.FormFile("file")
	}
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payment proof file is required", "data": err.Error()})
	}

	guestName := c.FormValue("full_name")
	guestPhone := c.FormValue("phone_number")

	// Generate unique filename preserving extension
	ext := filepath.Ext(file.Filename)
	uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// Save path under ./uploads/
	savePath := fmt.Sprintf("./uploads/%s", uniqueFileName)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save payment proof", "data": err.Error()})
	}

	// Compute public URL
	fileURL := fmt.Sprintf("/uploads/%s", uniqueFileName)

	// Update order found by invoice
	db := database.DB
	var order model.Order
	if err := db.Where("invoice_code = ?", invoice).First(&order).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Order not found", "data": nil})
	}
	order.PaymentProofURL = fileURL
	if guestName != "" {
		order.GuestName = guestName
	}
	if guestPhone != "" {
		order.GuestPhone = guestPhone
	}
	if err := db.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to update order with payment proof", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Payment proof uploaded", "data": order})
}