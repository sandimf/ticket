package database

import (
	"fmt"
	"log"
	"strconv"
	"api-fiber-gorm/config"
	"api-fiber-gorm/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB global connector
var DB *gorm.DB

// ConnectDB connect to db and migrate
func ConnectDB() {
	p := config.Config("DB_PORT")
	port, err := strconv.ParseUint(p, 10, 32)
	if err != nil {
		panic("failed to parse database port")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.Config("DB_HOST"),
		port,
		config.Config("DB_USER"),
		config.Config("DB_PASSWORD"),
		config.Config("DB_NAME"),
	)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	fmt.Println("Connection Opened to Database")

// 	DB.Migrator().DropTable(
//     &model.User{},
// 	// &model.Category{},
// 	&model.IssuedTicket{},
//     &model.TicketType{},
//     &model.Event{},
//     &model.OrderItem{},
//     &model.Order{},
// )
	// Auto migrate all models
	err = DB.AutoMigrate(
		&model.User{},
		// &model.Category{},
		&model.Event{},
		&model.Order{},
		&model.OrderItem{},
		&model.TicketType{},
		&model.IssuedTicket{},
		&model.Banner{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	fmt.Println("Database Migrated")
}
