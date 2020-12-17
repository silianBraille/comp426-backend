export class LineChart {
  constructor(data, container, width, height) {
    this.svgns = `http://www.w3.org/2000/svg`;
    this.data = data;
    this.root = null;
    this.container = container;
    this.min = null;
    this.max = null;
    this.record_count = null;
    this.record_labels = null;
    this.width = width || document.documentElement.clientWidth;
    this.height = height || 400; //document.documentElement.clientHeight;
    this.font_size = 15;
    this.x_label_font_size = 15;
    this.margin = 15;
    this.ticklength = 10;
    this.line_label_width = 90;
    this.axis_label_bbox = {
      x: this.ticklength + (this.font_size * 1.5),
      y: this.font_size
    }
    this.dataspace = {
      x: this.margin + this.axis_label_bbox.x,
      y: this.margin,
      width: this.width - (this.margin * 2) - this.axis_label_bbox.x - this.line_label_width,
      height: this.height - (this.margin * 2) - this.axis_label_bbox.y
    }

    this.init()
  }

  init () {
    this.find_min_max_values();
    this.create_chart();

    let idnum = 0;
    let max_records = 0;
    for (const series in this.data) {
      let series_data = this.data[series];
      (max_records<series_data.length) && (max_records = series_data.length);
      this.create_dataline(series_data, series, idnum++);
    }
    this.record_count = max_records;
  }

  find_min_max_values() {
    // TODO: find longest string in labels, set line_label_width and x_label_font_size accordingly
    // const longest_string = this.record_labels.reduce((a, b) => { return a.length > b.length ? a : b; });

    let max_records = 0;
    for (const series in this.data) {
      let row = this.data[series];
      (max_records<row.length) && (max_records = row.length);
      for (let record of row) {
        let val = parseFloat(record);

        if (null === this.max || null === this.min) {
          this.max = (!this.max && 0 !== this.max) ? val : this.max;
          this.min = (!this.min && 0 !== this.min) ? val : this.min;
        }

        if (`` !== val && !isNaN(val)) {
          this.max = this.max < val ? val : this.max;
          this.min = this.min > val ? val : this.min;
        }
      }
    }
    this.record_count = max_records;
  }

  single_precision ( float ) {
    return Math.round(float * 10) / 10;
  }

  create_chart() {
    this.root = document.createElementNS(this.svgns, `svg`);
    this.root.setAttribute(`xmlns`, this.svgns);
    this.root.setAttribute(`viewBox`, `0 0 ${this.width} ${this.height}`);

    let bg = document.createElementNS(this.svgns, `rect`);
    bg.setAttribute(`width`, this.width);
    bg.setAttribute(`height`, this.height);
    bg.setAttribute(`fill`, `white`);
    bg.setAttribute(`stroke`, `gainsboro`);
    this.root.appendChild(bg);

    this.container.appendChild(this.root);
  }

  create_axes() {
    //  create x axis
    let x_axis = document.createElementNS(this.svgns, `g`);
    x_axis.id = `x_axis`;
    x_axis.classList.add(`axis`, `x`);

    // create line
    let x_line = document.createElementNS(this.svgns, `path`);
    x_line.setAttribute(`d`, `M${this.dataspace.x},${this.dataspace.y + this.dataspace.height} H${this.dataspace.x + this.dataspace.width}`);
    x_line.classList.add(`axis`);
    x_axis.appendChild(x_line);

    // create tickmarks
    const t_len = this.record_count;
    const x_tick_distance = this.single_precision(this.dataspace.width / (t_len - 1));
    for (let t = 0; t_len > t; ++t) {
      let tick = document.createElementNS(this.svgns, `g`);

      let tick_line = document.createElementNS(this.svgns, `path`);
      tick_line.setAttribute(`d`, `M${this.dataspace.x + (x_tick_distance * t)},${this.dataspace.y + this.dataspace.height} V${this.dataspace.y + this.dataspace.height + this.ticklength}`);
      tick_line.classList.add(`axis`);
      tick.appendChild(tick_line);

      let tick_label = document.createElementNS(this.svgns, `text`);
      tick_label.setAttribute(`x`, this.dataspace.x + (x_tick_distance * t) );
      tick_label.setAttribute(`y`, this.dataspace.y + this.dataspace.height + this.ticklength + this.font_size);
      tick_label.classList.add(`tick_label`);
      tick_label.textContent = this.record_labels[t];
      tick.appendChild(tick_label);

      x_axis.appendChild(tick);
    }
    this.root.appendChild(x_axis);

    //  create y axis
    let y_axis = document.createElementNS(this.svgns, `g`);
    y_axis.id = `y_axis`;
    y_axis.classList.add(`axis`, `y`);

    // create line
    let y_line = document.createElementNS(this.svgns, `path`);
    y_line.setAttribute(`d`, `M${this.dataspace.x},${this.dataspace.y} V${this.dataspace.y + this.dataspace.height}`);
    y_line.classList.add(`axis`);
    y_axis.appendChild(y_line);

    // create tickmarks
    const y_tick_values = [0, (this.max / 2), (this.max)];
    const y_t_len = 3;
    const y_tick_distance = this.single_precision(this.dataspace.height / (y_t_len - 1));
    for (let t = 0; y_t_len > t; ++t) {
      let tick = document.createElementNS(this.svgns, `g`);

      let tick_line = document.createElementNS(this.svgns, `path`);
      tick_line.setAttribute(`d`, `M${this.dataspace.x},${(this.dataspace.y + this.dataspace.height) - (y_tick_distance * t)} H${this.dataspace.x - this.ticklength}`);
      tick_line.classList.add(`axis`);
      tick.appendChild(tick_line);

      let tick_label = document.createElementNS(this.svgns, `text`);
      tick_label.setAttribute(`x`, (this.dataspace.x - this.ticklength) - (this.font_size/4) );
      tick_label.setAttribute(`y`, (this.dataspace.y + this.dataspace.height) - (y_tick_distance * t) + (this.font_size * 0.3));
      tick_label.classList.add(`tick_label`);
      tick_label.textContent = y_tick_values[t];
      tick.appendChild(tick_label);

      y_axis.appendChild(tick);
    }

    this.root.appendChild(y_axis);
  }

  create_markers() {
    let defs = document.createElementNS(this.svgns, `defs`);

    for (let m = 0; this.record_count > m; ++m) {
      let marker = document.createElementNS(this.svgns, `marker`);
      marker.id = `marker-dot-${m}`;
      marker.setAttribute(`viewBox`, `-4 -4 8 8`);
      marker.setAttribute(`markerUnits`, `strokeWidth`);
      marker.setAttribute(`markerWidth`, `5`);
      marker.setAttribute(`markerHeight`, `5`);
      marker.setAttribute(`stroke`, `context-fill`);
      marker.setAttribute(`fill`, `context-fill`);

      let dot = document.createElementNS(this.svgns, `circle`);
      dot.setAttribute(`r`, 3 );
      marker.appendChild(dot);

      defs.appendChild(marker);
    }
    this.root.appendChild(defs);
  }

  create_dataline(series, label, series_id) {
    //  create dataline group
    let dataline_group = document.createElementNS(this.svgns, `g`);
    dataline_group.id = label;
    dataline_group.classList.add(`dataline`, `series_${series_id}`);

    // create line
    const l_len = this.record_count;
    const x_tick_distance = this.single_precision(this.dataspace.width / (l_len - 1));

    let prev_x_pos = 0;
    let prev_y_pos = 0;
    for (let l = 0; l_len > l; ++l) {
      let val = series[l];

      if (`` !== val && !isNaN(val)) {
        let dataline = document.createElementNS(this.svgns, `path`);
        let x_pos = this.dataspace.x + (x_tick_distance * l);
        let y_pos = (this.dataspace.y + this.dataspace.height) - (this.single_precision(this.dataspace.height / (this.max / val)));
        if (0 !== l) {
          let d = `M${prev_x_pos},${prev_y_pos} L${x_pos},${y_pos}`;
          dataline.setAttribute(`d`, d);
          // dataline.id = `series_${label}-segment_${l}`;
          dataline.id = `${label}-segment_${l}`;
          dataline_group.appendChild(dataline);
          dataline.setAttribute(`marker-start`, `url(#marker-dot-${series_id})`);
          dataline.setAttribute(`marker-end`, `url(#marker-dot-${series_id})`);
        }

        prev_x_pos = x_pos;
        prev_y_pos = y_pos;
      }
    }

    this.root.appendChild(dataline_group);
  }

  hilite_by_id( id_arr, is_hide ) {
    let classname = is_hide ? `hide` : `lowlite`;

    const datalines = document.querySelectorAll(`.dataline`);
    if (!id_arr || !id_arr.length) {
      for (const dataline of datalines) {
        dataline.classList.remove(`hide`, `lowlite`);
      }
    } else {
      for (const dataline of datalines) {
        dataline.classList.remove(`hide`, `lowlite`);
        dataline.classList.add(classname);
      }

      for (const id of id_arr) {
        // console.log(id);
        const dataline = document.getElementById(id);
        if (dataline) {
          dataline.classList.remove(`hide`, `lowlite`);
        }
      }
    }
  }

  hilite_segments_by_id( id_arr ) {
    const segments = document.querySelectorAll(`path[id*=-segment_]`);
    if (!id_arr || !id_arr.length) {
      for (const segment of segments) {
        segment.classList.remove(`segment_hilite`);
      }
    } else {
      for (const segment of segments) {
        segment.classList.remove(`segment_hilite`);
      }

      for (const id of id_arr) {
        const segment = document.getElementById(id);
        if (segment){
          segment.classList.add(`segment_hilite`);
        }
      }
    }
  }
}
