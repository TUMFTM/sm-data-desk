<template>
  <div class="graphic-panel">
    <div class="graphic-header">
      Emissions Breakdown
    </div>

    <div class="graphic-content">
      <PieChart :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const PieChart = Pie

const chartData = {
  labels: ['Transport', 'Heating', 'Electricity', 'Food'],
  datasets: [
    {
      data: [30, 25, 20, 25],
      backgroundColor: ['#0061c3', '#a2ad00', '#e37222', '#b2b2b2']
    }
  ]
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}
</script>

<style scoped>
.graphic-panel {
  background-color: #e6edf5;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graphic-header {
  background-color: #0061c3;
  color: white;
  font-size: 22px;
  padding: 4px 5px 0 12px;
  font-weight: bold;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  text-align: left;
}

.graphic-content {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
