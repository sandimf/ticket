package main

import (
	"log"

	"api-fiber-gorm/database"
	"api-fiber-gorm/router"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Static("/", "./public")
	// Serve direct uploads (e.g., /uploads/uuid.png) from ./uploads
	app.Static("/uploads", "./uploads")
	database.ConnectDB()

	router.SetupRoutes(app)
	
	log.Fatal(app.Listen(":5000"))
}
