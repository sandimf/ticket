package handler

import (
	"fmt"
	"path/filepath"

	"api-fiber-gorm/database"
	"api-fiber-gorm/model"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetAllBanners returns all banners ordered by 'order' ascending then by created_at
func GetAllBanners(c *fiber.Ctx) error {
	var banners []model.Banner
	db := database.DB
	db.Order(`"order" asc`).Order("created_at asc").Find(&banners)
	return c.JSON(fiber.Map{"status": "success", "message": "All banners", "data": banners})
}

// CreateBanner handles multipart upload for image and creates a banner record
// Expected form fields: title (string, optional), link_url (string, optional), active (bool, optional), order (int, optional), image (file, required)
func CreateBanner(c *fiber.Ctx) error {
	db := database.DB

	// 1. Get file from form (key: image)
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Banner image is required", "data": err.Error()})
	}

	// 2. Generate unique filename preserving extension
	ext := filepath.Ext(file.Filename)
	uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// 3. Save path under ./uploads/
	savePath := fmt.Sprintf("./uploads/%s", uniqueFileName)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save banner image", "data": err.Error()})
	}

	// 4. Compute public URL
	fileURL := fmt.Sprintf("/uploads/%s", uniqueFileName)

	// 5. Parse other fields
	title := c.FormValue("title")
	linkURL := c.FormValue("link_url")
	active := c.FormValue("active") == "true"
	order := 0
	if v := c.FormValue("order"); v != "" {
		fmt.Sscanf(v, "%d", &order)
	}

	banner := &model.Banner{
		Title:    title,
		ImageURL: fileURL,
		LinkURL:  linkURL,
		Active:   active,
		Order:    order,
	}

	if err := db.Create(banner).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create banner", "data": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Banner created", "data": banner})
}

// UpdateBanner updates banner metadata. If a new image file is sent, it replaces the image.
// Accepts either JSON body for metadata update or multipart form if image is replaced.
func UpdateBanner(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var banner model.Banner
	if err := db.First(&banner, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No banner found with ID", "data": nil})
	}

	// Try to get a file; if exists, replace image
	if file, err := c.FormFile("image"); err == nil && file != nil {
		// Replace image
		ext := filepath.Ext(file.Filename)
		uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
		savePath := fmt.Sprintf("./uploads/%s", uniqueFileName)
		if err := c.SaveFile(file, savePath); err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save banner image", "data": err.Error()})
		}
		banner.ImageURL = fmt.Sprintf("/uploads/%s", uniqueFileName)
	}

	// Parse metadata from form if present
	if v := c.FormValue("title"); v != "" { banner.Title = v }
	if v := c.FormValue("link_url"); v != "" { banner.LinkURL = v }
	if v := c.FormValue("active"); v != "" { banner.Active = (v == "true") }
	if v := c.FormValue("order"); v != "" { fmt.Sscanf(v, "%d", &banner.Order) }

	// If no multipart fields, try JSON body
	if c.Get("Content-Type") == "application/json" {
		var payload struct {
			Title   *string `json:"title"`
			LinkURL *string `json:"link_url"`
			Active  *bool   `json:"active"`
			Order   *int    `json:"order"`
		}
		if err := c.BodyParser(&payload); err == nil {
			if payload.Title != nil { banner.Title = *payload.Title }
			if payload.LinkURL != nil { banner.LinkURL = *payload.LinkURL }
			if payload.Active != nil { banner.Active = *payload.Active }
			if payload.Order != nil { banner.Order = *payload.Order }
		}
	}

	if err := db.Save(&banner).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to update banner", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Banner updated", "data": banner})
}

func DeleteBanner(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var banner model.Banner
	if err := db.First(&banner, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No banner found with ID", "data": nil})
	}

	if err := db.Delete(&banner).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to delete banner", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Banner deleted"})
}