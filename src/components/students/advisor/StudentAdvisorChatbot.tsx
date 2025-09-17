import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestion } from "@/components/ai-elements/suggestion";
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { useSession } from "@/hooks/auth-client";

interface StudentAdvisorChatbotProps {
  student: Student;
  infractions: Infraction[];
  followUps: FollowUp[];
  className?: string;
}

export function StudentAdvisorChatbot({
  student,
  infractions,
  followUps,
  className,
}: StudentAdvisorChatbotProps) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Obtener el usuario actual
  const { session } = useSession();
  const currentUser = session?.user;

  // Sugerencias predefinidas
  const suggestions = [
    "¿Qué estrategias recomiendas para este estudiante?",
    "¿Cómo puedo mejorar la comunicación?",
    "¿Qué plan de seguimiento sugieres?",
    "¿Cuáles podrían ser las causas de estas faltas?",
    "¿Qué técnicas de motivación puedo usar?",
    "¿Cómo involucrar más a los padres?"
  ];

  // Preparar los datos del estudiante para el endpoint
  const studentData = {
    name: student.firstname || student.name.split(' ')[0], // Solo primer nombre por privacidad
    grade: student.grado || undefined,
    age: undefined, // No disponible en el tipo Student actual
    level: student.seccion,
    infractions: infractions.map((inf) => ({
      id: inf.id,
      date: inf.date,
      type: inf.type,
      description: inf.description,
      severity: inf.type, // Usando type como severity
      attended: inf.attended,
      observaciones: inf.observaciones,
    })),
    followUps: followUps.map((fu) => ({
      id: fu.id,
      description: fu.details, // Usando details como description
      date: fu.date,
      status: "active", // Status por defecto
    })),
    userName: currentUser?.fullName || "Usuario", // Agregar el nombre del usuario
    userRole: currentUser?.role || "Usuario", // Agregar el rol del usuario
  };

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/v1/student-advisor",
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage(
      { text: message.text },
      {
        body: { studentData },
      }
    );
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // Estadísticas rápidas para mostrar en el header
  const stats = {
    totalInfractions: infractions.length,
    unattendedInfractions: infractions.filter((i) => !i.attended).length,
    recentInfractions: infractions.filter(
      (i) => new Date(i.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    totalFollowUps: followUps.length,
  };

  if (!isExpanded) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Consejero Educativo IA
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {stats.totalInfractions} faltas totales
            </Badge>
            <Badge variant="destructive" className="text-xs">
              {stats.unattendedInfractions} sin atender
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats.recentInfractions} recientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Obtén estrategias personalizadas y recomendaciones profesionales para apoyar el
            desarrollo de {student.firstname || student.name.split(' ')[0]}.
          </p>
          <Button onClick={() => setIsExpanded(true)} className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Iniciar Consulta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Consejero Educativo IA - {student.firstname || student.name.split(' ')[0]}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {stats.totalInfractions} faltas totales
          </Badge>
          <Badge variant="destructive" className="text-xs">
            {stats.unattendedInfractions} sin atender
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {stats.recentInfractions} últimos 30 días
          </Badge>
          <Badge variant="default" className="text-xs">
            {stats.totalFollowUps} seguimientos
          </Badge>
        </div>
        <Separator className="mt-3" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] flex flex-col overflow-hidden">
          {/* Área de conversación */}
          <div className="flex-1 px-4 overflow-y-auto">
            <Conversation className="h-full">
              <ConversationContent>
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    icon={<Bot className="size-12 text-primary" />}
                    title="¡Hola! Soy tu consejero educativo IA"
                    description={`Estoy aquí para ayudarte con estrategias y recomendaciones para apoyar a ${student.firstname || student.name.split(' ')[0]}. Puedes preguntarme sobre manejo de comportamiento, técnicas de comunicación, planes de intervención y más.`}
                  >
                    <div className="mt-6 space-y-4 w-full">
                      <p className="text-sm font-medium text-muted-foreground text-center">
                        Sugerencias para comenzar:
                      </p>
                      <div className="relative">
                        <Carousel
                          opts={{
                            align: "start",
                            loop: true,
                          }}
                          className="w-full"
                        >
                          <CarouselContent className="-ml-1">
                            {suggestions.map((suggestion, index) => (
                              <CarouselItem key={index} className="pl-1 basis-full md:basis-1/2">
                                <Suggestion
                                  suggestion={suggestion}
                                  onClick={handleSuggestionClick}
                                  className="whitespace-normal text-left h-auto min-h-[48px] py-3 px-4 w-full"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                      </div>
                    </div>
                  </ConversationEmptyState>
                ) : (
                  messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent 
                        variant="flat"
                        className={`${
                          message.role === 'user' 
                            ? 'bg-[#be1522] text-white' 
                            : ''
                        }`}
                      >
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <Response
                                  key={`${message.id}-${i}`}
                                  className="prose prose-sm max-w-none dark:prose-invert"
                                >
                                  {part.text}
                                </Response>
                              );
                            default:
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}
                {status === "submitted" && (
                  <Message from="assistant">
                    <MessageContent variant="flat">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader size={16} />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>

          {/* Área de input */}
          <div className="flex-shrink-0 p-4 border-t">
            {error && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">
                  Error: {error.message}. Por favor, verifica tu configuración de API.
                </p>
              </div>
            )}

            <PromptInput onSubmit={handleSubmit} className="w-full">
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta sobre estrategias educativas..."
                  className="min-h-[80px] resize-none"
                />
              </PromptInputBody>
              <PromptInputToolbar>
                <div className="flex-1" />
                <PromptInputSubmit
                  status={status === "streaming" ? "streaming" : "ready"}
                  disabled={!input.trim() || status === "streaming"}
                />
              </PromptInputToolbar>
            </PromptInput>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Este consejero IA proporciona recomendaciones basadas en buenas prácticas educativas.
              Siempre consulta con profesionales cuando sea necesario.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
