package handler

import (
	"api-fiber-gorm/database" 
	"api-fiber-gorm/model"    
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)
// Create order request
type CreateOrderRequest struct {
	UserID uint `json:"user_id"`
	Items  []struct {
		TicketTypeID uint `json:"ticket_type_id"`
		Quantity     int  `json:"quantity"`
	} `json:"items"`
}
func CreateOrder(c *fiber.Ctx) error {
	db := database.DB
	req := new(CreateOrderRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}
	if len(req.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Order must contain at least one item", "data": nil})
	}
	var totalAmount int64 = 0
	var orderItems []model.OrderItem
	var orderToCreate model.Order // Kita siapkan order di luar transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		for _, item := range req.Items {
			var ticketType model.TicketType
			if err := tx.First(&ticketType, item.TicketTypeID).Error; err != nil {
				return fmt.Errorf("ticket type with ID %d not found", item.TicketTypeID)
			}
			if ticketType.TotalStock < item.Quantity {
				return fmt.Errorf("not enough stock for ticket '%s'", ticketType.Name)
			}
			orderItem := model.OrderItem{
				TicketTypeID: item.TicketTypeID,
				Quantity:     item.Quantity,
				PricePerItem: ticketType.Price,
			}
			orderItems = append(orderItems, orderItem)
			totalAmount += (ticketType.Price * int64(item.Quantity))
		}
		orderToCreate = model.Order{
			UserID:        req.UserID,
			TotalAmount:   totalAmount,
			PaymentStatus: "pending",
			InvoiceCode:   fmt.Sprintf("INV-%d", time.Now().UnixNano()),
			OrderItems:    orderItems,
		}
		if err := tx.Create(&orderToCreate).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create order", "data": err.Error()})
	}
	// Kembalikan data order yang baru dibuat
	return c.JSON(fiber.Map{"status": "success", "message": "Order created successfully", "data": orderToCreate})
}
func GetOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var order model.Order
	db.Preload("User").Preload("OrderItems").Preload("OrderItems.TicketType").First(&order, id)
	if order.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No order found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Order found", "data": order})
}
func GetOrdersForUser(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	db := database.DB
	var orders []model.Order
	db.Where("user_id = ?", userID).Preload("OrderItems").Find(&orders)
	return c.JSON(fiber.Map{"status": "success", "message": "Orders for user found", "data": orders})
}
func DeleteOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var order model.Order
	db.First(&order, id)
	if order.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No order found with ID", "data": nil})
	}
	db.Delete(&order)
	return c.JSON(fiber.Map{"status": "success", "message": "Order deleted (not recommended)", "data": nil})
}

// UpdateOrderStatus [DIPERBARUI]
// Ini sekarang menangani pembuatan tiket (IssuedTicket) saat status "paid"
func UpdateOrderStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	type StatusUpdatePayload struct {
		PaymentStatus string `json:"payment_status"`
	}
	var payload StatusUpdatePayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}
	
	var updatedOrder model.Order

	// Gunakan Transaction untuk update status DAN generate tiket
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil data order, item, dan user
		var order model.Order
		if err := tx.Preload("OrderItems").Preload("User").First(&order, id).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		// 2. Update status
		order.PaymentStatus = payload.PaymentStatus
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// 3. LOGIKA KRUSIAL: Jika dibayar, generate tiket
		if order.PaymentStatus == "paid" {
			for _, item := range order.OrderItems {
				// Buat tiket sebanyak quantity
				for i := 0; i < item.Quantity; i++ {
					newTicket := model.IssuedTicket{
						OrderItemID:   item.ID,
						AttendeeName:  order.User.FullName, // Default ke nama pembeli
						AttendeeEmail: order.User.Email,    // Default ke email pembeli
						// Kode tiket unik (di app nyata, gunakan UUID atau hash)
						TicketCode:    fmt.Sprintf("TIX-%d-%d-%d", order.ID, item.ID, i), 
						CheckedIn:     false,
					}
					if err := tx.Create(&newTicket).Error; err != nil {
						// Jika gagal buat 1 tiket, seluruh transaksi di-rollback
						return err 
					}
				}
			}
		}

		updatedOrder = order // Simpan untuk respons
		return nil // Commit transaksi
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No order found with ID", "data": nil})
		}
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to update order status", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Order status updated and tickets issued (if paid)", "data": updatedOrder})
}