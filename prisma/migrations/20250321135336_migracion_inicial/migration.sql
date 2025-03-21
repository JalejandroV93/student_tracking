-- CreateTable
CREATE TABLE "Estudiantes" (
    "id" INTEGER NOT NULL,
    "codigo" INTEGER NOT NULL,
    "nombre" TEXT,
    "seccion" TEXT,
    "nivel" TEXT,

    CONSTRAINT "Estudiantes_pkey" PRIMARY KEY ("id","codigo")
);

-- CreateTable
CREATE TABLE "Faltas" (
    "hash" TEXT NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "codigo_estudiante" INTEGER NOT NULL,
    "tipo_falta" TEXT,
    "numero_falta" INTEGER,
    "descripcion_falta" TEXT,
    "detalle_falta" TEXT,
    "acciones_reparadoras" TEXT,
    "autor" TEXT,
    "fecha" DATE,
    "trimestre" TEXT,
    "nivel" TEXT,

    CONSTRAINT "Faltas_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Casos" (
    "id_caso" SERIAL NOT NULL,
    "hash_falta" TEXT NOT NULL,
    "fecha_inicio" DATE,
    "estado" TEXT NOT NULL DEFAULT 'Abierto',

    CONSTRAINT "Casos_pkey" PRIMARY KEY ("id_caso")
);

-- CreateTable
CREATE TABLE "Seguimientos" (
    "id_seguimiento" SERIAL NOT NULL,
    "id_caso" INTEGER NOT NULL,
    "tipo_seguimiento" TEXT,
    "fecha_seguimiento" DATE,
    "detalles" TEXT,
    "autor" TEXT,

    CONSTRAINT "Seguimientos_pkey" PRIMARY KEY ("id_seguimiento")
);

-- CreateTable
CREATE TABLE "AlertSettings" (
    "id" SERIAL NOT NULL,
    "seccion" TEXT NOT NULL,
    "primary_threshold" INTEGER NOT NULL,
    "secondary_threshold" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertSettings_seccion_key" ON "AlertSettings"("seccion");

-- AddForeignKey
ALTER TABLE "Faltas" ADD CONSTRAINT "Faltas_id_estudiante_codigo_estudiante_fkey" FOREIGN KEY ("id_estudiante", "codigo_estudiante") REFERENCES "Estudiantes"("id", "codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Casos" ADD CONSTRAINT "Casos_hash_falta_fkey" FOREIGN KEY ("hash_falta") REFERENCES "Faltas"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguimientos" ADD CONSTRAINT "Seguimientos_id_caso_fkey" FOREIGN KEY ("id_caso") REFERENCES "Casos"("id_caso") ON DELETE RESTRICT ON UPDATE CASCADE;
