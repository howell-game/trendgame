<template>
  <div class="trend-graph-container">
    <canvas ref="trendCanvas"></canvas>
    <div v-if="meanROI !== null && maxEROI !== null" class="roi-info">
      <p><strong>Mean ROI:</strong> {{ meanROI }}</p>
      <p><strong>Max ROI:</strong> {{ maxEROI }}</p>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  props: ["categoryName", "categoryId"],
  data() {
    return {
      trendChart: null,
      trendData: [],
      yPosition: 0, // Ensures continuous movement
      meanROI: null, // Store mean ROI
      maxEROI: null, // Store max ROI
    };
  },
  async mounted() {
    await this.fetchTrendData();
    this.initializeChart();
  },
  methods: {
    async fetchTrendData() {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/api/investments/trend-data`);

        const data = await response.json();
        if (data.success) {
          const categoryData = data.data.find(c => c.category === this.categoryName);
          if (categoryData) {
            this.trendData = categoryData.outcomes.map((entry, index) => ({
              x: index, // Normalized X values (0 - 100)
              y: this.getNextY(entry.outcome === "Supply" ? 1 : -1),
              outcome: entry.outcome,
            }));

            if (this.trendData.length > 100) {
              this.trendData = this.trendData.slice(-100); // Keep latest 100 entries
            }
            // **Recalculate X values to always stay within 0 - 100**
        this.trendData.forEach((point, index) => {
          point.x = index;
        });

            // Store ROI values
            this.meanROI = categoryData.meanROI;
            this.maxEROI = categoryData.maxEROI;

            this.updateChart();
          }
        }
      } catch (error) {
        console.error("Error fetching trend data:", error);
      }
    },

    getNextY(value) {
      this.yPosition += value;
      return this.yPosition;
    },

    initializeChart() {
      if (!this.$refs.trendCanvas) return;
      const ctx = this.$refs.trendCanvas.getContext("2d");

      this.trendChart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              label: this.categoryName,
              data: this.trendData,
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              title: { display: true, text: "overtime" },
              min: 0,
              max: 100, // Keep X-axis range fixed
            },
            y: {
              title: { display: true, text: "Outcome Curve" },
              ticks: {
                callback: (value, index, values) => {
                  if (index === 0) return "Demand"; // Bottom label
                  if (index === values.length - 1) return "Supply"; // Top label
                  return ""; // Hide other labels
                },
              },
              suggestedMin: () => Math.min(...this.trendData.map(d => d.y)) - 2, // Keeps lower bound slightly below min
              suggestedMax: () => Math.max(...this.trendData.map(d => d.y)) + 2, // Keeps upper bound slightly above max
            },
          },
          elements: {
            line: {
              tension: 0,
            },
          },
          plugins: {
            tooltip: {
              enabled: true,
            },
          },
        },
        plugins: [
          {
            id: "customLineColor",
            afterDatasetDraw(chart) {
              const { ctx, data } = chart;
              const dataset = data.datasets[0];

              ctx.save();
              for (let i = 0; i < dataset.data.length - 1; i++) {
                const start = dataset.data[i];
                const end = dataset.data[i + 1];

                ctx.beginPath();
                ctx.moveTo(chart.scales.x.getPixelForValue(start.x), chart.scales.y.getPixelForValue(start.y));
                ctx.lineTo(chart.scales.x.getPixelForValue(end.x), chart.scales.y.getPixelForValue(end.y));

                ctx.strokeStyle = start.outcome === "Supply" ? "green" : "red";
                ctx.lineWidth = 2;
                ctx.stroke();
              }
              ctx.restore();
            },
          },
        ],
      });
    },

    updateChart() {
      if (this.trendChart) {
        this.trendChart.data.datasets[0].data = this.trendData;
        this.trendChart.update();
      }
    },
  },
};
</script>

<style scoped>
.trend-graph-container {
  width: 100%;
  max-width: 100%;
  height: 400px;
}

.roi-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
}

.roi-info p {
  margin: 5px 0;
  font-size: 14px;
}
</style>
