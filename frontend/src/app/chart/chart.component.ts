import { Component, OnInit} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { ChartdataService } from '../chartdata.service';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit {
  stateData: any[] = [];
  genderAgeData: any[] = [];
  selectedState: string | null = null;
  pieChart: Chart<'pie'> | null = null;
  barChart: Chart<'bar'> | null = null;

  constructor(private chartDataService: ChartdataService) {}

  ngOnInit() {
    this.loadPatientStateData();
  }

  loadPatientStateData() {
    this.chartDataService.getPatientStateData().subscribe({
      next: (data) => {
        this.stateData = data;
        this.renderPieChart();
      },
      error: (error) => console.error('Error loading state data:', error)
    });
  }

  loadGenderAgeData(state: string) {
    this.chartDataService.getGenderAgeData(state).subscribe({
      next: (data) => {
        console.log('Gender and Age Data:', data);
        this.genderAgeData = data;
        this.selectedState = state;
        setTimeout(() => {
          if (this.genderAgeData.length > 0) {
            this.renderBarChart();
          } else {
            console.warn('No data available for the selected state');
          }
        }, 100);
      },
      error: (error) => console.error('Error loading gender and age data:', error)
    });
  }

  renderPieChart() {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      if (this.pieChart) {
        this.pieChart.destroy();
      }

      const labels = this.stateData.map(item => item.state);
      const data = this.stateData.map(item => item.count);

      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{ data, backgroundColor: ['#FFD700', '#663399', '#7CFC00'] }],
        },
        options: {
          responsive: true,
          aspectRatio: 5.5,
          onClick: (event, elements) => {
            if (elements.length) {
              const stateIndex = elements[0].index;
              const selectedState = labels[stateIndex];
              this.loadGenderAgeData(selectedState);
            }
          },
        },
      });
    } else {
      console.error('Pie Chart canvas context is null');
    }
  }

  renderBarChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('Bar Chart canvas element is null');
      return;
    }

    const ctx = canvas?.getContext('2d');

    if (ctx) {
      if (this.barChart) {
        this.barChart.destroy();
      }

      const ageGroups = ['<18', '18-30', '30-50', '50-70', '70+'];
      const maleData = Array(ageGroups.length).fill(0);
      const femaleData = Array(ageGroups.length).fill(0);

      for (const entry of this.genderAgeData) {
        const { age, gender, count } = entry;
        let ageIndex = -1;

        if (age < 18) ageIndex = 0;
        else if (age >= 18 && age < 30) ageIndex = 1;
        else if (age >= 30 && age < 50) ageIndex = 2;
        else if (age >= 50 && age < 70) ageIndex = 3;
        else if (age >= 70) ageIndex = 4;

        if (ageIndex !== -1) {
          if (gender.toLowerCase() === 'male') {
            maleData[ageIndex] += count;
          } else if (gender.toLowerCase() === 'female') {
            femaleData[ageIndex] += count;
          }
        }
      }

      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ageGroups,
          datasets: [
            { label: 'Male', data: maleData, backgroundColor: '#0096FF', barThickness:30, maxBarThickness: 50  },
            { label: 'Female', data: femaleData, backgroundColor: '#F88379', barThickness:30, maxBarThickness: 50  }
          ],
        },
        options: {
          responsive: true,
          aspectRatio: 5.5,
          scales: {
            x: { title: { display: true, text: 'Age Group' } },
            y: { 
              title: { display: true, text: 'Number of Patients' },
              stacked: false // Enable stacking
            },
          },
          plugins: {
            legend: { position: 'top' },
          },
        },
      });
    } else {
      console.error('Bar Chart canvas context is null');
    }
  }
}