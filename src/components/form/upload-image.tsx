import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import Cropper, { type Area } from "react-easy-crop"
import { type ControllerRenderProps } from "react-hook-form"

import { getImageUrl } from "@/lib/utils"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function UploadImage({ ...field }: ControllerRenderProps) {
  const imageRef = useRef<HTMLInputElement>(null)

  const [isHovered, setIsHovered] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(
    field.value ? getImageUrl(field.value) : null
  )

  const [isCropOpen, setIsCropOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  )
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  function handleImageClick() {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setOriginalFile(file)
      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)
      setIsCropOpen(true)
    }
  }

  function handleImageRemove() {
    if (imageRef.current) {
      imageRef.current.value = ""
    }
    setPreviewImage(null)
    field.onChange(null)
  }

  async function createCroppedFile(
    originalFile: File,
    croppedAreaPixels: CropArea
  ): Promise<File> {
    const image = new window.Image()
    image.src = URL.createObjectURL(originalFile)

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height

        ctx?.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        )

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File(
                [blob],
                `cropped-${originalFile.name}`,
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              )
              resolve(croppedFile)
            }
          },
          "image/jpeg",
          0.95
        )
      }
    })
  }

  async function handleCropComplete(_: Area, croppedPixels: CropArea) {
    setCroppedAreaPixels(croppedPixels)
  }

  async function handleCropSave() {
    if (originalFile && croppedAreaPixels) {
      const croppedFile = await createCroppedFile(
        originalFile,
        croppedAreaPixels
      )
      const croppedImageUrl = URL.createObjectURL(croppedFile)
      setPreviewImage(croppedImageUrl)
      field.onChange(croppedFile)
      setIsCropOpen(false)
    }
  }

  useEffect(() => {
    if (!field.value) {
      handleImageRemove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value])

  return (
    <>
      <div
        className="size-60 relative cursor-pointer rounded-2xl hover:opacity-80 transition-opacity duration-200 border overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={previewImage ?? "/images/placeholder.svg"}
          alt="doctor"
          width={300}
          height={300}
          className="size-full object-cover"
          onClick={handleImageClick}
          placeholder="blur"
          blurDataURL="/images/placeholder.svg"
        />
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          ref={imageRef}
        />
        {previewImage && isHovered && (
          <div
            className="absolute inset-0 size-full flex justify-center items-center z-10"
            onClick={handleImageRemove}
          >
            <div className="bg-foreground/70 rounded-full p-5">
              <Trash2 size={16} className="text-background" />
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle className="sr-only">Kırp</DialogTitle>
          <DialogDescription className="sr-only">
            Kırpma yapmak için resmi kırpın
          </DialogDescription>
          <div className="relative h-[400px]">
            {previewImage && (
              <Cropper
                image={previewImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCropOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCropSave}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
