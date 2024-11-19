import { useEffect, useState } from "react";

function App() {
  const [describeOutput, setDescribeOutput] = useState(null);
  const [chartSrc, setChartSrc] = useState(null); // Para almacenar la imagen del gráfico

  useEffect(() => {
    async function loadPyodideAndRun() {
      try {
        // Cargar Pyodide
        const pyodide = await window.loadPyodide();

        // Instalar pandas y matplotlib
        await pyodide.loadPackage(["pandas", "matplotlib"]);

        // Código Python para cargar el dataset, describirlo y generar un gráfico
        const pythonCode = `
import pandas as pd
import io
import matplotlib.pyplot as plt
from pyodide.http import open_url
import base64
from io import BytesIO

# Descargar el archivo local desde la carpeta public
url = "/diabetes.tab.txt"
response = open_url(url).read()

# Cargar el dataset en pandas
df = pd.read_csv(io.StringIO(response), sep='\\t')

# Generar descripción del dataset
describe_output = df.describe().to_string()

# Crear un gráfico (por ejemplo, histograma de la columna 'AGE')
plt.figure(figsize=(8, 6))
df['AGE'].plot(kind='hist', bins=20, color='skyblue', edgecolor='black')
plt.title('Distribución de la Edad')
plt.xlabel('Edad')
plt.ylabel('Frecuencia')
plt.grid(True)

# Guardar el gráfico como base64
buf = BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)
image_base64 = base64.b64encode(buf.read()).decode('utf-8')
buf.close()

# Resultados a retornar
describe_output, image_base64
`;

        // Ejecutar el código Python
        const [output, chart] = await pyodide.runPythonAsync(pythonCode);

        // Guardar los resultados en el estado
        setDescribeOutput(output); // Descripción del dataset
        setChartSrc(`data:image/png;base64,${chart}`); // Gráfico en base64
      } catch (err) {
        console.error("Error ejecutando Pyodide:", err);
        setDescribeOutput(
          "Error al cargar el dataset o generar el gráfico. Por favor, intenta de nuevo."
        );
      }
    }

    loadPyodideAndRun();
  }, []);

  return (
    <div>
      <h1>React + Pyodide + pandas + matplotlib</h1>
      {describeOutput ? (
        <>
          <pre>{describeOutput}</pre>
          <h2>Gráfico Generado:</h2>
          {chartSrc && <img src={chartSrc} alt="Gráfico generado" />}
        </>
      ) : (
        <p>Cargando descripción del dataset y generando gráfico...</p>
      )}
    </div>
  );
}

export default App;
