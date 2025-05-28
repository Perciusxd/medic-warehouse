"use client"

import { useHospital } from "@/context/HospitalContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

export default function AboutPage() {
  const { loggedInHospital } = useHospital()

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="Hospital" />
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{loggedInHospital}</h1>
            <p className="text-muted-foreground">Healthcare Provider</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Get in touch with us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span>contact@{loggedInHospital.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span>123 Healthcare Street, Medical District</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Us</CardTitle>
              <CardDescription>Our mission and values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {loggedInHospital} is committed to providing exceptional healthcare services
                to our community. We focus on patient-centered care, innovation, and
                continuous improvement in medical practices.
              </p>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <span>Established 1995</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Services</CardTitle>
            <CardDescription>Comprehensive healthcare solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Emergency Care",
                "Primary Care",
                "Specialized Treatment",
                "Diagnostic Services",
                "Rehabilitation",
                "Preventive Care"
              ].map((service) => (
                <div
                  key={service}
                  className="rounded-lg border p-4 text-center hover:bg-accent"
                >
                  {service}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}