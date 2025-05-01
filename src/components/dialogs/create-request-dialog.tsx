import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const FormSchema = z.object({
    mode: z.enum(["auto", "manual", "advanced"]),
    customInput: z.string().optional(),
})

export default function DynamicForm({requestData, openDialog, onOpenChange}) {
    console.log(requestData);
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors },
    } = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            mode: "auto",
            customInput: "Default auto value",
        },
    })

    const mode = watch("mode")
    const autoDefaultRef = useRef("Default auto value")

    useEffect(() => {
        if (mode === "auto") {
            setValue("customInput", autoDefaultRef.current)
        } else if (mode === "manual" || mode === "advanced") {
            if (getValues("customInput") === autoDefaultRef.current) {
                resetField("customInput")
            }
        }
    }, [mode, setValue, getValues, resetField])

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }

            const result = await response.json()
            console.log("Success:", result)
            alert("Form submitted successfully!")
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("Submission failed.")
        }
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label>
                            <input type="radio" value="auto" {...register("mode")} />
                            Auto Mode
                        </label>
                        <label className="ml-4">
                            <input type="radio" value="manual" {...register("mode")} />
                            Manual Mode
                        </label>
                        <label className="ml-4">
                            <input type="radio" value="advanced" {...register("mode")} />
                            Advanced Mode
                        </label>
                    </div>

                    <div>
                        <label>
                            Custom Input:
                            <input
                                type="text"
                                {...register("customInput")}
                                disabled={mode === "auto"}
                                className="ml-2 border p-1"
                            />
                        </label>
                        {errors.customInput && (
                            <p className="text-red-500">{errors.customInput.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                        Submit
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
