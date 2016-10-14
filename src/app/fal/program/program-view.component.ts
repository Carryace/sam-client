import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';
import {FHService} from '../../common/service/api/fh.service';
import {ProgramService} from '../services/program.service';
import { Subscription } from 'rxjs/Subscription';
import {DictionaryService} from '../services/dictionary.service';
import {HistoricalIndexService} from '../services/historical-index.service';
import { FilterMultiArrayObjectPipe } from '../../common/pipes/filter-multi-array-object.pipe';
import * as _ from 'lodash';
import * as d3 from 'd3';


@Component({
  moduleId: __filename,
  templateUrl: 'program-view.component.html',
  styleUrls: ['program-view.style.css'],
  providers: [
    FHService,
    ProgramService,
    DictionaryService,
    HistoricalIndexService,
    FilterMultiArrayObjectPipe
  ]
})
export class ProgramViewComponent implements OnInit {
  oProgram:any;
  oFederalHierarchy:any;
  aRelatedProgram:any[] = [];
  currentUrl:string;
  aDictionaries:any = [];
  authorizationIdsGrouped:any[];
  oHistoricalIndex:any;
  aAlert:any = [];

  private sub:Subscription;

    constructor(
      private route:ActivatedRoute,
      private location:Location,
      private oHistoricalIndexService: HistoricalIndexService,
      private oProgramService:ProgramService,
      private oFHService:FHService,
      private oDictionaryService:DictionaryService,
      private FilterMultiArrayObjectPipe: FilterMultiArrayObjectPipe) {}

  ngOnInit() {
    this.currentUrl = this.location.path();

    //init Dictionaries
    let aDictionaries = [
      'program_subject_terms',
      'date_range',
      'match_percent',
      'assistance_type',
      'applicant_types',
      'assistance_usage_types',
      'beneficiary_types',
      'functional_codes'
    ];

    this.sub = this.route.params.subscribe(params => {
      let id = params['id']; //id will be a string, not a number
      this.oProgramService.getProgramById(id).subscribe(res => {
          this.oProgram = res;

          //check if this program has changed in this FY
          if ((new Date(this.oProgram.program.publishedDate)).getFullYear() < new Date().getFullYear()) {
              this.aAlert.push({"labelname":"not-updated-since", "config":{ "type": "warning", "title": "", "description": "Note: \n\
This Federal Assistance Listing was not updated by the issuing agency in "+(new Date()).getFullYear()+". \n\
Please contact the issuing agency listed under \"Contact Information\" for more information." }});
          }

          this.oDictionaryService.getDictionaryById(aDictionaries.join(',')).subscribe(res => {
            for (var key in res) {
              this.aDictionaries[key] = res[key];
            }
            if(this.oProgram.program.data.financial.obligations){
              this.createVisualization(this.prepareVisualizationData(this.oProgram.program.data.financial.obligations));
            }
          });
          //get authorizations and group them by id
          var auths = this.oProgram.program.data.authorizations;
          this.authorizationIdsGrouped = _.values(_.groupBy(auths, 'authorizationId'));
          this.oFHService.getFederalHierarchyById(res.program.data.organizationId,false,false)
            .subscribe(res => {
              this.oFederalHierarchy = res;
            });
          this.oHistoricalIndexService.getHistoricalIndexByProgramNumber(id, this.oProgram.program.data.programNumber)
            .subscribe(res => {
              this.oHistoricalIndex = res;
          });
          if (this.oProgram.program.data.relatedPrograms.flag != "na") {
            for (let programId of this.oProgram.program.data.relatedPrograms.relatedTo) {
              this.oProgramService.getLatestProgramById(programId).subscribe(relatedFal => {
                if(typeof relatedFal.program !== 'undefined')
                {
                  this.aRelatedProgram.push({
                    "programNumber": relatedFal.program.data.programNumber,
                    "id": relatedFal.program.data._id
                  });
                }
              })
            }
          }
        },
          err => {
          console.log('Error logging', err)
        }
      );

    });
  }


  createVisualization(financialData): void {

    /**
     * --------------------------------------------------
     * Containers
     * --------------------------------------------------
     */
    d3.select("#visualization")
      .insert("svg")
      .attr("id", "chart")
      .attr("style", "width: 100%; height:300px;");

    d3.select("#visualization")
      .insert("table")
      .attr("id", "chart-table");

    /**
     * --------------------------------------------------
     * Data Grouping
     * --------------------------------------------------
     */
    let assistanceTotals = d3.nest()
      .key(function (d: any) { return d.obligation; })
      .key(function (d: any) { return d.year; }).sortKeys(d3.ascending)
      .rollup(function (values) {
        return { "total": d3.sum(values, function (d: any) { return +d.amount; }) }
      })
      .entries(financialData);

    let assistanceTotalsGroupedByYear = d3.nest()
      .key(function (d: any) { return d.year; }).sortKeys(d3.ascending)
      .key(function (d: any) { return d.obligation; })
      .rollup(function (values) {
        let isEstimate = false;
        let year;
        let formatyear;
        values.forEach(function(item){ 
          if(item.estimate){ isEstimate = true; }
          year = item.year;
        });
        return { "year": formatYear(String(year),isEstimate), "total": d3.sum(values, function (d: any) { return +d.amount; }) }
      })
      .entries(financialData);

    let assistanceDetails = d3.nest()
      .key(function (d: any) { return d.obligation; })
      .key(function (d: any) { return d.info; })
      .key(function (d: any) { return d.year; }).sortKeys(d3.ascending)
      .entries(financialData);

    let vizTotals = d3.nest()
      .key(function (d: any) { return d.year; }).sortKeys(d3.ascending)
      .rollup(function (values) {
        return { "total": d3.sum(values, function (d: any) { return +d.amount; }) }
      })
      .entries(financialData);

    /**
     * --------------------------------------------------
     * Stack Chart
     * --------------------------------------------------
     */

    let svg = d3.select("#visualization > svg");
    let margin = { top: 30, left: 110, right: 20, bottom: 40 };

    let height = parseInt(svg.style("height"), 10) - margin.top - margin.bottom;
    let width = parseInt(svg.style("width"), 10) - margin.left - margin.right;
    svg.attr("height", parseInt(svg.style("height"), 10));
    svg.attr("width", parseInt(svg.style("width"), 10));

    const stackColors = [
      "#046b99",
      "#9bdaf1",
      "#5b616b",
      "#fad980",
      "#cd2026",
      "#e59393",
      "#00a6d2",
      "#f9c642",
      "#aeb0b5",
      "#981b1e",
      "#3e94cf",
      "#4c2c92",
      "#8ba6ca"
    ];

    let g = svg.append("g")
      .attr("class", "bars")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
    
    let { series: series, keys: stackKeys } = getStackProperties(assistanceTotalsGroupedByYear);

    // Axis Range
    let x = d3.scaleBand().range([0, width]).padding(0.25);
    let y = d3.scaleLinear().range([height, 0]);
    let z = d3.scaleOrdinal().range(stackColors);

    // Axis Domain
    x.domain(assistanceTotalsGroupedByYear.map(function (d) { return d.values[0].value.year; }));
    y.domain([0, d3.max(vizTotals, 
      function (item) {
        return item.value.total;
      })]).nice();
    z.domain(stackKeys);

    // Axis DOM
    let axis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xAxis = d3.axisBottom(x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(10);

    let yAxis = d3.axisLeft(y)
      .ticks(5, "$,r")
      .tickSizeInner(-width)
      .tickSizeOuter(0)
      .tickPadding(5);;

    let gX = axis.append("g")
      .attr("class", "axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", -(height + 15))
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .attr("class", "svg-font-bold")
      .text("Obligation(s)");

    let gY = axis.append("g")
      .attr("class", "axis--y")
      .call(yAxis);

    // Data Join
    let chart = g.selectAll(".serie")
      .data(series, function (d) {
        return d;
      });

    // Enter
    let graph = chart.enter().append("g");

    let serie = graph.attr("class", "serie")
      .attr("data-assistance", function (d) { return d.key; })
      .attr("fill", function (d) { return z(d.key); });

    let rect = serie.selectAll("rect")
      .data(function (d) { return d; })
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d.data.values[0].value.year) + (x.bandwidth() / 4);
      })
      .attr("y", function (d) {
        return y(d[1]);
      })
      .style("cursor", "pointer")
      .attr("height", function (d) {
        return y(d[0]) - y(d[1]);
      })
      .attr("width", x.bandwidth() / 2);

    // Clean DOM
    d3.select(".axis--y .domain").remove();

    // Style
    d3.selectAll("svg text").attr("style", "font-size: 17px; font-family: 'Source Sans Pro';");
    d3.selectAll(".svg-font-bold").attr("style", "font-size: 17px; font-family: 'Source Sans Pro'; font-weight: 700;");
    d3.selectAll("svg .axis--y .tick line").attr("style", "stroke: rgba(0, 0, 0, 0.1);");
    
    // Tooltip
    let tooltip;
    rect.on("mouseover", function (d) {
        tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("display", "inline")
          .style("position", "absolute")
          .style("text-align", "center")
          .style("font", "14px Source Sans Pro")
          .style("padding", "10px")
          .style("margin", "20px 0 0 20px")
          .style("background", "white")
          .style("-webkit-box-shadow", "3px 5px 30px -4px rgba(0,0,0,0.33)")
          .style("-moz-box-shadow", "3px 5px 30px -4px rgba(0,0,0,0.33)")
          .style("box-shadow", "3px 5px 30px -4px rgba(0,0,0,0.33)")
      })
      .on("mousemove", function (d) {
        tooltip.html(this.parentNode.attributes["data-assistance"].value + "<span style='display: block; font-size: 17px; font-weight: 700;'>" + d3.format("($,")(d[1] - d[0]) + "</span>")
          .style("left", (d3.event.pageX - 30) + "px")
          .style("top", (d3.event.pageY - 10) + "px");
      })
      .on("mouseout", function () {
        d3.select(".tooltip").remove();
      });


    function formatYear(year: string, estimate: boolean): string {
      let formattedYear = "FY " + year.slice(2, 4);
      return estimate ? formattedYear + " (est.)" : formattedYear;
    }

    function getStackProperties(data) {
      let loopCounter = 0;
      let yearLoop = 0;
      let stackKeys = d3.set();

      let stack = d3.stack()
        .keys(function (d) {
          d.forEach(function (e) {
            e.values.forEach(function (el) {
              stackKeys.add(el.key);
            });
          });
          return stackKeys.values();
        })
        .value(function (d, key, i, m) {
          if (loopCounter == m.length) {
            loopCounter = 0;
            yearLoop++;
          }
          loopCounter++;
          return d.values[yearLoop].value.total;
        });

      return { "series": stack(data), "keys": stackKeys.values() };
    }
    
    /**
     * --------------------------------------------------
     * Table
     * --------------------------------------------------
     */
    let table = d3.select("#visualization table");
    let thead = table.append("thead");
    let tbody = table.append("tbody");

    // Table header
    thead.selectAll("th")
      .data(assistanceTotalsGroupedByYear)
      .enter().append("th")
      .text(function (d) { return d.values[0].value.year; });

    thead.insert("th", ":first-child").text("Obligation(s)");

    // Table: Assistance Totals
    tbody.selectAll("tr")
      .data(assistanceTotals)
      .enter()
      .append("tr")
      .style("font-weight", "700")
      .attr("class", "total")
      .selectAll("td")
      .data(function (d: any) {
        return d.values;
      })
      .enter()
      .append("td")
      .html(function (d: any) {
        return d3.format("($,")(d.value.total);
      });

    // Insert assistance type name column
    tbody.selectAll("tr")
      .data(assistanceTotals)
      .insert("td", ":first-child")
      .html(function (d) {
        return "<span class=\"legend\" style=\"background-color:" + z(d.key) + "; border:1px solid #000; width: 10px; height: 10px; display: inline-block;\"></span>  " + d.key + " Total";
      });

    // Table: Assistance Details
    tbody.selectAll("tr")
      .data(assistanceDetails)
      .append("tr")
      .attr("class", "details")
      .selectAll("td")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("tr")
      .attr("class", "detail")
      .html(function (d: any) {
        // If additional info content its empty remove row
        if(!d.key){
          this.remove();
        }
        return "<td>" + d.key + "</td>";
      })
      .selectAll("tr")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("td")
      .text(function (d: any) {
        return d3.format("($,")(d.values[0].amount);
      });

    // Move and unwrap assistance details
    d3.selectAll("tr.details").each(function () {
      this.parentNode.parentNode.insertBefore(this, this.parentNode.nextSibling);
      this.outerHTML = this.innerHTML;
    });


    // Table Totals
    table.selectAll("tbody")
      .append("tr")
      .html("<td>Totals</td>")
      .style("font-weight", "700")
      .attr("class", "totals")
      .selectAll("tr")
      .data(vizTotals)
      .enter()
      .append("td")
      .html(function (d: any) {
        return d3.format("($,")(d.value.total);
      });

  }

  prepareVisualizationData(financialData){
    let self = this;
    let formattedFinancialData = []

    function getAssistanceType(id): string {
      return self.FilterMultiArrayObjectPipe.transform([id], self.aDictionaries.assistance_type, 'element_id', true, 'elements')[0].value;
    }

    financialData.map(function(item){
      for(let year in item.values){
        let obligation = "No Obligation";
        if(item.assistanceType){
         obligation = getAssistanceType(item.assistanceType);
        }else if(item.questions.salary_or_expense.flag === "yes"){
          obligation = "Salary or Expense";
        }
        let financialItem = {
          "obligation": obligation,
          "info": item.additionalInfo.content || "",
          "year": +year,
          "amount": item.values[year]["actual"] || item.values[year]["estimate"] || 0,
          "estimate": !!!item.values[year]["actual"]
        }
        formattedFinancialData.push(financialItem);
      }      
    });
    return formattedFinancialData;
  }

}
