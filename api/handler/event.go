package handler

import (
	"api-fiber-gorm/database"
	"api-fiber-gorm/model"   
	"fmt" // Import fmt
	"path/filepath" // Import path/filepath
	"regexp"
	"strings"
	"time"    // Import time

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid" // Import UUID untuk nama file unik
)

// generateSlug creates a URL-friendly slug from a string
func generateSlug(s string) string {
	// Convert to lowercase
	s = strings.ToLower(s)
	
	// Replace spaces with hyphens
	s = strings.ReplaceAll(s, " ", "-")
	
	// Remove special characters
	reg := regexp.MustCompile("[^a-z0-9-]")
	s = reg.ReplaceAllString(s, "")
	
	// Replace multiple hyphens with a single one
	reg = regexp.MustCompile("-+")
	s = reg.ReplaceAllString(s, "-")
	
	// Trim hyphens from start and end
	s = strings.Trim(s, "-")
	
	return s
}

//  Event Handlers
// (Fungsi GetAllEvents, GetEvent, CreateEvent, UpdateEvent, DeleteEvent ada di sini)

func GetAllEvents(c *fiber.Ctx) error {
	db := database.DB
	var events []model.Event
	db.Find(&events)
	return c.JSON(fiber.Map{"status": "success", "message": "All events", "data": events})
}

func GetEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var event model.Event
	db.Preload("TicketTypes").First(&event, id)
	if event.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No event found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Event found", "data": event})
}

func GetEventBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	db := database.DB
	var event model.Event
	
	// Find event by slug
	result := db.Preload("TicketTypes").Where("slug = ?", slug).First(&event)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No event found with this slug", "data": nil})
	}
	
	return c.JSON(fiber.Map{"status": "success", "message": "Event found", "data": event})
}

func CreateEvent(c *fiber.Ctx) error {
	db := database.DB

	// 1. Ambil file dari form
	file, err := c.FormFile("poster_image") // "poster_image" harus sama dengan nama field di frontend
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Poster image is required", "data": err.Error()})
	}

	// 2. Buat nama file yang unik untuk menghindari konflik
	// Menggunakan UUID: e.g., "uuid-asli.jpg"
	ext := filepath.Ext(file.Filename) // Dapatkan ekstensi file (e.g., ".jpg")
	uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// 3. Tentukan path untuk menyimpan file
	// Simpan ke ./uploads (disajikan via app.Static("/uploads", "./uploads"))
	savePath := fmt.Sprintf("./uploads/%s", uniqueFileName)

	// 4. Simpan file ke server
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file", "data": err.Error()})
	}

	// 5. Buat URL yang akan diakses oleh frontend
	// Ini adalah path yang akan disimpan di database
	fileURL := fmt.Sprintf("/uploads/%s", uniqueFileName)

	// 6. Parse sisa data form (sekarang semuanya adalah string)
	startTime, err := time.Parse(time.RFC3339, c.FormValue("start_datetime"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid start_datetime format", "data": err.Error()})
	}
	endTime, err := time.Parse(time.RFC3339, c.FormValue("end_datetime"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid end_datetime format", "data": err.Error()})
	}
    
    // Ambil user_id dari JWT token yang disimpan oleh middleware Protected
    token := c.Locals("user").(*jwt.Token)
    claims := token.Claims.(jwt.MapClaims)
    userID := uint(claims["user_id"].(float64))
    
    // Gunakan userID sebagai organizerID
    organizerID := userID

	// 7. Buat struct Event secara manual
	title := c.FormValue("title")
	
	// Generate slug dari title
	slug := generateSlug(title)
	
	// Pastikan slug unik dengan menambahkan random string jika perlu
	var count int64
	db.Model(&model.Event{}).Where("slug = ?", slug).Count(&count)
	if count > 0 {
		// Tambahkan random string ke slug
		randomStr := uuid.New().String()[:8]
		slug = fmt.Sprintf("%s-%s", slug, randomStr)
	}

	event := &model.Event{
		OrganizerID:    organizerID,
		Title:          title,
		Slug:           slug,
		Description:    c.FormValue("description"),
		Category:       c.FormValue("category"),
		VenueName:      c.FormValue("venue_name"),
		Address:        c.FormValue("address"),
		City:           c.FormValue("city"),
		StartDateTime:  startTime,
		EndDateTime:    endTime,
		Status:         c.FormValue("status"),
		PosterImageURL: fileURL, 
	}

	if event.Status == "" {
		event.Status = "draft"
	}

	// 8. Simpan ke database
	if err := db.Create(&event).Error; err != nil {
		// Jika DB gagal, hapus file yang sudah di-upload (rollback)
		// os.Remove(savePath) // (Opsional tapi bagus)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create event in DB", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Created event", "data": event})
}

func UpdateEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var event model.Event
	db.First(&event, id)
	if event.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No event found with ID", "data": nil})
	}
	var updateData model.Event
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't parse request body", "data": err.Error()})
	}
	event.Title = updateData.Title
	event.Description = updateData.Description
	event.Category = updateData.Category
	event.VenueName = updateData.VenueName
	event.Address = updateData.Address
	event.City = updateData.City
	event.StartDateTime = updateData.StartDateTime
	event.EndDateTime = updateData.EndDateTime
	event.PosterImageURL = updateData.PosterImageURL
	event.Status = updateData.Status
	db.Save(&event)
	return c.JSON(fiber.Map{"status": "success", "message": "Event successfully updated", "data": event})
}

func DeleteEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var event model.Event
	db.First(&event, id)
	if event.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No event found with ID", "data": nil})
	}
	db.Delete(&event)
	return c.JSON(fiber.Map{"status": "success", "message": "Event successfully deleted", "data": nil})
}
