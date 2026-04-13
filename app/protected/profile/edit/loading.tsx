export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f3e7]">
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        {/* Back link */}
        <div className="h-6 bg-slate-200 rounded-lg w-32 mb-10 animate-pulse" />

        <div className="space-y-12">
          {/* Sección: Editar Habilidades y Horarios */}
          <section className="bg-white rounded-2xl p-10 shadow-lg border border-[#d7e5ef]">
            {/* Header */}
            <div className="mb-12 animate-pulse">
              <div className="h-11 bg-slate-200 rounded-lg w-1/2 mb-4" />
              <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
            </div>

            {/* Grid de dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* COLUMNA IZQUIERDA */}
              <div className="border-r border-[#9cd2d3] pr-10 animate-pulse">
                {/* Habilidades que enseñas */}
                <div className="mb-12">
                  <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-6" />

                  {/* Tabla de habilidades */}
                  <div className="mb-10 space-y-3">
                    <div className="h-12 bg-slate-100 rounded-lg" />
                    <div className="h-16 bg-slate-100 rounded-lg" />
                    <div className="h-16 bg-slate-100 rounded-lg" />
                    <div className="h-16 bg-slate-100 rounded-lg" />
                  </div>

                  {/* Selectores y botón */}
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-200 rounded-lg w-1/3 mb-3" />
                    <div className="h-11 bg-slate-100 rounded-lg" />
                    <div className="h-6 bg-slate-200 rounded-lg w-1/4 mb-3" />
                    <div className="flex gap-3">
                      <div className="h-11 bg-slate-100 rounded-lg flex-1" />
                      <div className="h-11 bg-slate-100 rounded-lg w-24" />
                    </div>
                    <div className="h-11 bg-[#0057cc]/30 rounded-lg" />
                  </div>
                </div>

                {/* Separador */}
                <div className="border-t border-[#9cd2d3] py-12" />

                {/* Lo que busco aprender */}
                <div className="animate-pulse">
                  <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-6" />

                  {/* Tabla */}
                  <div className="mb-10 space-y-3">
                    <div className="h-12 bg-slate-100 rounded-lg" />
                    <div className="h-16 bg-slate-100 rounded-lg" />
                  </div>

                  {/* Selector y botón */}
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-200 rounded-lg w-2/3 mb-3" />
                    <div className="flex gap-3">
                      <div className="h-11 bg-slate-100 rounded-lg flex-1" />
                      <div className="h-11 bg-[#0057cc]/30 rounded-lg w-24" />
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="animate-pulse">
                {/* Disponibilidad Horaria */}
                <div>
                  <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-6" />

                  {/* Selectores */}
                  <div className="space-y-5 mb-10">
                    <div>
                      <div className="h-5 bg-slate-200 rounded-lg w-1/4 mb-3" />
                      <div className="h-11 bg-slate-100 rounded-lg" />
                    </div>
                    <div>
                      <div className="h-5 bg-slate-200 rounded-lg w-1/4 mb-3" />
                      <div className="h-11 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="h-12 bg-[#0057cc]/30 rounded-lg" />
                  </div>

                  {/* Mis horarios */}
                  <div className="space-y-5">
                    <div className="h-6 bg-slate-200 rounded-lg w-1/3" />

                    {/* Horarios por día */}
                    <div className="space-y-4">
                      <div className="border border-[#9cd2d3] rounded-lg p-4 space-y-3">
                        <div className="h-6 bg-slate-200 rounded w-1/4" />
                        <div className="h-10 bg-slate-100 rounded" />
                        <div className="h-10 bg-slate-100 rounded" />
                        <div className="h-10 bg-slate-100 rounded" />
                      </div>
                      <div className="border border-[#9cd2d3] rounded-lg p-4 space-y-3">
                        <div className="h-6 bg-slate-200 rounded w-1/4" />
                        <div className="h-10 bg-slate-100 rounded" />
                        <div className="h-10 bg-slate-100 rounded" />
                      </div>
                      <div className="border border-[#9cd2d3] rounded-lg p-4 space-y-3">
                        <div className="h-6 bg-slate-200 rounded w-1/4" />
                        <div className="h-10 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="border-t border-[#9cd2d3] mt-12 pt-12 animate-pulse">
              <div className="h-8 bg-slate-200 rounded-lg w-1/4 mb-8" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="h-5 bg-slate-200 rounded-lg w-1/3 mb-3" />
                  <div className="h-12 bg-slate-100 rounded-lg" />
                </div>
                <div>
                  <div className="h-5 bg-slate-200 rounded-lg w-1/3 mb-3" />
                  <div className="h-12 bg-slate-100 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-12 mt-8 animate-pulse">
              <div className="h-12 bg-[#0057cc]/30 rounded-lg w-48" />
              <div className="h-12 bg-slate-200 rounded-lg w-48" />
            </div>
          </section>

          {/* Sección: Cambiar Contraseña */}
          <section className="bg-white rounded-2xl p-10 shadow-lg border border-[#d7e5ef]">
            {/* Header */}
            <div className="mb-12 animate-pulse">
              <div className="h-11 bg-slate-200 rounded-lg w-1/3 mb-4" />
              <div className="h-6 bg-slate-100 rounded-lg w-2/3" />
            </div>

            {/* Formulario centrado */}
            <div className="space-y-8 max-w-2xl mx-auto animate-pulse">
              {/* Contraseña Actual */}
              <div>
                <div className="h-5 bg-slate-200 rounded-lg w-1/3 mb-3" />
                <div className="h-12 bg-slate-100 rounded-lg" />
              </div>

              {/* Contraseña Nueva */}
              <div>
                <div className="h-5 bg-slate-200 rounded-lg w-1/3 mb-3" />
                <div className="h-12 bg-slate-100 rounded-lg mb-5" />

                {/* Strength indicator */}
                <div className="mb-5 space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                </div>

                {/* Requisitos */}
                <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="space-y-3">
                    <div className="h-5 bg-slate-100 rounded" />
                    <div className="h-5 bg-slate-100 rounded" />
                    <div className="h-5 bg-slate-100 rounded" />
                    <div className="h-5 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <div className="h-5 bg-slate-200 rounded-lg w-1/3 mb-3" />
                <div className="h-12 bg-slate-100 rounded-lg" />
              </div>

              {/* Botón */}
              <div className="h-12 bg-[#0057cc]/30 rounded-lg w-full" />

              {/* Texto */}
              <div className="text-center space-y-2">
                <div className="h-4 bg-slate-100 rounded-lg w-3/4 mx-auto" />
                <div className="h-4 bg-slate-100 rounded-lg w-2/3 mx-auto" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
