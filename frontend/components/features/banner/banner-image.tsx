"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export function BannerImage() {
  const banners = [
    "/banner.jpeg",
    "/banner.jpeg",
    "/banner.jpeg",
  ]

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <Carousel 
      className="w-full"
      plugins={[plugin.current]}
      opts={{
        align: "start",
        loop: true,
      }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {banners.map((src, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="border-0 shadow-none">
                <CardContent className="relative w-full aspect-[4/1] overflow-hidden rounded-lg">
                  <Image
                    src={src}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
      <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
    </Carousel>
  )
}