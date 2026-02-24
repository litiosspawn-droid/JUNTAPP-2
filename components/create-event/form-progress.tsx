"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

interface FormStep {
  id: string
  title: string
  description: string
  required: boolean
}

interface FormProgressProps {
  currentStep: number
  steps: FormStep[]
  isSubmitting: boolean
}

export function FormProgress({ currentStep, steps, isSubmitting }: FormProgressProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  const getStepIcon = (stepIndex: number) => {
    if (isSubmitting && stepIndex === steps.length - 1) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    if (stepIndex < currentStep) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (stepIndex === currentStep) {
      return <Circle className="h-4 w-4 text-primary fill-primary" />
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Progreso de creación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  index === currentStep
                    ? 'border-primary bg-primary/5'
                    : index < currentStep
                    ? 'border-green-200 bg-green-50'
                    : 'border-muted bg-muted/30'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm ${
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.required && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                      Requerido
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
