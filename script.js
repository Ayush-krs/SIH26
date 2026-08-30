/* =========================================================
   METROCHECK
   Cross-source packaged commodity verification prototype
========================================================= */


let uploadedImages = [];

let onlineListing = null;


/* =========================
   ELEMENTS
========================= */

const homePage =
  document.getElementById("homePage");

const uploadPage =
  document.getElementById("uploadPage");

const analysisPage =
  document.getElementById("analysisPage");

const resultsPage =
  document.getElementById("resultsPage");

const reportPage =
  document.getElementById("reportPage");


const uploadArea =
  document.getElementById("uploadArea");

const imageInput =
  document.getElementById("imageInput");

const listingInput =
  document.getElementById("listingInput");

const imagePreview =
  document.getElementById("imagePreview");

const imageCount =
  document.getElementById("imageCount");

const analyzeButton =
  document.getElementById("analyzeButton");


/* =========================
   PAGE NAVIGATION
========================= */

function hideAllPages() {

  homePage.classList.add("hidden");

  uploadPage.classList.add("hidden");

  analysisPage.classList.add("hidden");

  resultsPage.classList.add("hidden");

  reportPage.classList.add("hidden");

}


function startInspection() {

  hideAllPages();

  uploadPage.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function goHome() {

  hideAllPages();

  homePage.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function scrollToHowItWorks() {

  document
    .getElementById("howItWorks")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =========================
   PACKAGE IMAGE UPLOAD
========================= */

uploadArea.addEventListener(
  "click",
  () => imageInput.click()
);


imageInput.addEventListener(
  "change",
  (event) => {
    addImages(event.target.files);
  }
);


uploadArea.addEventListener(
  "dragover",
  (event) => {

    event.preventDefault();

    uploadArea.classList.add("dragging");

  }
);


uploadArea.addEventListener(
  "dragleave",
  () => {

    uploadArea.classList.remove("dragging");

  }
);


uploadArea.addEventListener(
  "drop",
  (event) => {

    event.preventDefault();

    uploadArea.classList.remove("dragging");

    addImages(event.dataTransfer.files);

  }
);


function addImages(files) {

  Array.from(files).forEach(
    (file) => {

      if (!file.type.startsWith("image/")) {

        return;

      }


      uploadedImages.push({

        file: file,

        url: URL.createObjectURL(file)

      });

    }
  );


  imageInput.value = "";

  renderImages();

}


function renderImages() {

  imagePreview.innerHTML = "";


  const panelNames = [

    "Front",

    "Back",

    "Side",

    "Additional"

  ];


  uploadedImages.forEach(
    (image, index) => {

      const panelName =
        panelNames[index] ||
        `Panel ${index + 1}`;


      const card =
        document.createElement("div");


      card.className =
        "image-card";


      card.innerHTML = `

        <img
          src="${image.url}"
          alt="${panelName} product panel"
        >


        <div class="image-info">

          <span>
            ${panelName}
          </span>


          <button
            class="remove-image"
            onclick="removeImage(${index})"
          >
            Remove
          </button>

        </div>

      `;


      imagePreview.appendChild(card);

    }
  );


  imageCount.textContent =
    `${uploadedImages.length} image${
      uploadedImages.length !== 1
        ? "s"
        : ""
    }`;


  analyzeButton.disabled =
    uploadedImages.length === 0;

}


function removeImage(index) {

  if (
    uploadedImages[index] &&
    uploadedImages[index].url
  ) {

    URL.revokeObjectURL(
      uploadedImages[index].url
    );

  }


  uploadedImages.splice(index, 1);


  renderImages();

}


/* =========================
   ONLINE LISTING UPLOAD
========================= */

listingInput.addEventListener(
  "change",
  (event) => {

    const file =
      event.target.files[0];


    if (!file) {

      return;

    }


    if (!file.type.startsWith("image/")) {

      return;

    }


    onlineListing = {

      file: file,

      url: URL.createObjectURL(file)

    };


    renderListing();

  }
);


function renderListing() {

  const preview =
    document.getElementById(
      "listingPreview"
    );


  const image =
    document.getElementById(
      "listingImage"
    );


  const fileName =
    document.getElementById(
      "listingFileName"
    );


  if (!onlineListing) {

    preview.classList.add(
      "hidden"
    );

    return;

  }


  image.src =
    onlineListing.url;


  fileName.textContent =
    onlineListing.file.name;


  preview.classList.remove(
    "hidden"
  );

}


function removeListing() {

  if (
    onlineListing &&
    onlineListing.url
  ) {

    URL.revokeObjectURL(
      onlineListing.url
    );

  }


  onlineListing = null;


  listingInput.value = "";


  renderListing();

}


/* =========================
   ANALYSIS
========================= */

async function analyzeProduct() {

  if (uploadedImages.length === 0) {

    return;

  }


  hideAllPages();


  analysisPage.classList.remove(
    "hidden"
  );


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });


  const logs =
    document.getElementById(
      "analysisLog"
    );


  logs.innerHTML = "";


  resetAnalysisSteps();


  await runAnalysisStep(

    1,

    "Reading package images and detecting text regions..."

  );


  await runAnalysisStep(

    2,

    "Extracting declarations such as MRP, quantity, date and manufacturer..."

  );


  await runAnalysisStep(

    3,

    onlineListing

      ? "Comparing package declarations with the online listing and checking machine-readable data..."

      : "Checking package declarations and scanning for QR / barcode information..."

  );


  await runAnalysisStep(

    4,

    "Building evidence-backed findings and preparing the inspection report..."

  );


  setTimeout(
    showResults,
    600
  );

}


function resetAnalysisSteps() {

  for (
    let i = 1;
    i <= 4;
    i++
  ) {

    document
      .getElementById(
        `step${i}`
      )
      .classList.remove(
        "active",
        "completed"
      );

  }

}


function runAnalysisStep(
  stepNumber,
  message
) {

  return new Promise(
    (resolve) => {

      const step =
        document.getElementById(
          `step${stepNumber}`
        );


      step.classList.add(
        "active"
      );


      addLog(message);


      setTimeout(
        () => {

          step.classList.remove(
            "active"
          );


          step.classList.add(
            "completed"
          );


          addLog(
            "✓ Completed"
          );


          resolve();

        },
        1000
      );

    }
  );

}


function addLog(message) {

  const line =
    document.createElement("p");


  line.textContent =
    `> ${message}`;


  document
    .getElementById(
      "analysisLog"
    )
    .appendChild(line);

}


/* =========================
   DEMO INSPECTION RESULT
   Temporary until OCR is connected
========================= */

const inspectionResult = {

  productName:
    "Example Packaged Commodity",


  status:
    "violation",


  message:
    "A cross-source discrepancy was detected. The package and online listing contain different MRP values. Manual verification is recommended.",


  declarations: [

    {

      name:
        "Product name",

      value:
        "Example Packaged Commodity",

      status:
        "pass"

    },


    {

      name:
        "Manufacturer / Packer",

      value:
        "ABC Foods Pvt. Ltd.",

      status:
        "pass"

    },


    {

      name:
        "Net Quantity",

      value:
        "500 g",

      status:
        "pass"

    },


    {

      name:
        "Maximum Retail Price (MRP)",

      value:
        "₹199",

      status:
        "violation"

    },


    {

      name:
        "Packing Date",

      value:
        "August 2026",

      status:
        "pass"

    },


    {

      name:
        "Consumer Care",

      value:
        "1800-XXX-XXXX",

      status:
        "pass"

    }

  ],


  comparisons: [

    {

      field:
        "MRP",

      package:
        "₹199",

      online:
        "₹249",

      status:
        "mismatch"

    },


    {

      field:
        "Net Quantity",

      package:
        "500 g",

      online:
        onlineListing
          ? "500 g"
          : "Not supplied",

      status:
        onlineListing
          ? "match"
          : "review"

    },


    {

      field:
        "Manufacturer",

      package:
        "ABC Foods Pvt. Ltd.",

      online:
        onlineListing
          ? "ABC Foods Pvt. Ltd."
          : "Not supplied",

      status:
        onlineListing
          ? "match"
          : "review"

    },


    {

      field:
        "QR / Barcode",

      package:
        "Detected",

      online:
        "Encoded information",

      status:
        "match"

    }

  ],


  findings: [

    {

      title:
        "MRP mismatch across sources",

      description:
        "The maximum retail price detected on the physical package differs from the value shown in the online product listing.",

      status:
        "violation",

      evidence:
        "Package: ₹199 · Online listing: ₹249"

    },


    {

      title:
        "Machine-readable code detected",

      description:
        "A QR / barcode region was detected on the uploaded package and is available for verification against the extracted declarations.",

      status:
        "pass",

      evidence:
        "QR / barcode source: package image"

    },


    {

      title:
        "Physical readability requires verification",

      description:
        "Image-based screening cannot conclusively establish physical print-size compliance. An inspector should verify print height and placement.",

      status:
        "review",

      evidence:
        "Physical verification required"

    }

  ]

};


/* =========================
   RESULTS
========================= */

function showResults() {

  hideAllPages();


  resultsPage.classList.remove(
    "hidden"
  );


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });


  document
    .getElementById(
      "productName"
    )
    .textContent =
      inspectionResult.productName;


  document
    .getElementById(
      "inspectionDate"
    )
    .textContent =
      `Inspected on ${new Date().toLocaleString()}`;


  renderOverallStatus();

  renderSummary();

  renderDeclarations();

  renderComparisons();

  renderFindings();

}


function renderOverallStatus() {

  const box =
    document.getElementById(
      "overallStatus"
    );


  box.className =
    `overall-status ${
      inspectionResult.status
    }`;


  const title =
    document.getElementById(
      "overallTitle"
    );


  const badge =
    document.getElementById(
      "overallBadge"
    );


  if (
    inspectionResult.status ===
    "pass"
  ) {

    title.textContent =
      "Compliant";

    badge.textContent =
      "Compliant";

    badge.style.background =
      "var(--pass-bg)";

    badge.style.color =
      "var(--pass)";

  }
  else if (
    inspectionResult.status ===
    "review"
  ) {

    title.textContent =
      "Review Required";

    badge.textContent =
      "Review Required";

    badge.style.background =
      "var(--review-bg)";

    badge.style.color =
      "var(--review)";

  }
  else {

    title.textContent =
      "Potential Discrepancy";

    badge.textContent =
      "Potential Violation";

  }


  document
    .getElementById(
      "overallMessage"
    )
    .textContent =
      inspectionResult.message;

}


function renderSummary() {

  const declarationCount =
    inspectionResult.declarations.length;


  const matches =
    inspectionResult.comparisons.filter(
      item =>
        item.status === "match"
    ).length;


  const review =
    inspectionResult.declarations.filter(
      item =>
        item.status === "review"
    ).length
    +
    inspectionResult.comparisons.filter(
      item =>
        item.status === "review"
    ).length;


  const violations =
    inspectionResult.declarations.filter(
      item =>
        item.status === "violation"
    ).length
    +
    inspectionResult.comparisons.filter(
      item =>
        item.status === "mismatch"
    ).length;


  document
    .getElementById(
      "summaryDeclarations"
    )
    .textContent =
      declarationCount;


  document
    .getElementById(
      "summaryMatches"
    )
    .textContent =
      matches;


  document
    .getElementById(
      "summaryReview"
    )
    .textContent =
      review;


  document
    .getElementById(
      "summaryViolations"
    )
    .textContent =
      violations;

}


function formatStatus(status) {

  if (status === "pass") {

    return "Compliant";

  }


  if (status === "review") {

    return "Review Required";

  }


  return "Potential Violation";

}


/* =========================
   DECLARATIONS
========================= */

function renderDeclarations() {

  const container =
    document.getElementById(
      "declarationsTable"
    );


  container.innerHTML =
    `<div class="declaration-table"></div>`;


  const table =
    container.querySelector(
      ".declaration-table"
    );


  inspectionResult.declarations.forEach(
    (item) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "declaration-row";


      row.innerHTML = `

        <strong>
          ${item.name}
        </strong>


        <p>
          ${item.value}
        </p>


        <span
          class="status ${item.status}"
        >
          ${formatStatus(item.status)}
        </span>

      `;


      table.appendChild(row);

    }
  );

}


/* =========================
   COMPARISONS
========================= */

function renderComparisons() {

  renderComparisonInto(
    document.getElementById(
      "comparisonContainer"
    )
  );

}


function renderComparisonInto(container) {

  container.innerHTML = "";


  inspectionResult.comparisons.forEach(
    (item) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "comparison-result";


      const statusText =
        item.status === "match"
          ? "Match"
          : item.status === "mismatch"
            ? "Mismatch"
            : "Review";


      card.innerHTML = `

        <strong>
          ${item.field}
        </strong>


        <div class="comparison-source">

          <span>
            Package:
          </span>

          <strong>
            ${item.package}
          </strong>

        </div>


        <div class="comparison-source">

          <span>
            Online:
          </span>

          <strong>
            ${item.online}
          </strong>

        </div>


        <span
          class="comparison-status ${item.status}"
        >
          ${statusText}
        </span>

      `;


      container.appendChild(card);

    }
  );

}


/* =========================
   FINDINGS
========================= */

function renderFindings() {

  const container =
    document.getElementById(
      "findingsContainer"
    );


  container.innerHTML = "";


  inspectionResult.findings.forEach(
    (finding) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        `finding-card ${finding.status}`;


      card.innerHTML = `

        <div class="finding-card-header">

          <h3>
            ${finding.title}
          </h3>

          <span
            class="status ${finding.status}"
          >
            ${formatStatus(finding.status)}
          </span>

        </div>


        <p>
          ${finding.description}
        </p>


        <div class="finding-evidence">

          Evidence:
          ${finding.evidence}

        </div>

      `;


      container.appendChild(card);

    }
  );

}


/* =========================
   REPORT
========================= */

function generateReport() {

  hideAllPages();


  reportPage.classList.remove(
    "hidden"
  );


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });


  document
    .getElementById(
      "reportId"
    )
    .textContent =

    `INS-${new Date().getFullYear()}-${
      String(
        Math.floor(
          Math.random() * 9000
        ) + 1000
      )
    }`;


  document
    .getElementById(
      "reportSummary"
    )
    .textContent =
      inspectionResult.message;


  renderReportDeclarations();

  renderReportComparisons();

  renderReportFindings();

}


function renderReportDeclarations() {

  const container =
    document.getElementById(
      "reportDeclarations"
    );


  container.innerHTML =
    `<div class="declaration-table"></div>`;


  const table =
    container.querySelector(
      ".declaration-table"
    );


  inspectionResult.declarations.forEach(
    (item) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "declaration-row";


      row.innerHTML = `

        <strong>
          ${item.name}
        </strong>


        <p>
          ${item.value}
        </p>


        <span
          class="status ${item.status}"
        >
          ${formatStatus(item.status)}
        </span>

      `;


      table.appendChild(row);

    }
  );

}


function renderReportComparisons() {

  renderComparisonInto(

    document.getElementById(
      "reportComparison"
    )

  );

}


function renderReportFindings() {

  const container =
    document.getElementById(
      "reportFindings"
    );


  container.innerHTML = "";


  inspectionResult.findings.forEach(
    (finding) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        `finding-card ${finding.status}`;


      card.innerHTML = `

        <div class="finding-card-header">

          <h3>
            ${finding.title}
          </h3>

          <span
            class="status ${finding.status}"
          >
            ${formatStatus(finding.status)}
          </span>

        </div>


        <p>
          ${finding.description}
        </p>


        <div class="finding-evidence">

          Evidence:
          ${finding.evidence}

        </div>

      `;


      container.appendChild(card);

    }
  );

}


/* =========================
   BACK / RESET
========================= */

function backToResults() {

  hideAllPages();

  resultsPage.classList.remove(
    "hidden"
  );

}


function newInspection() {

  uploadedImages.forEach(
    (image) => {

      if (image.url) {

        URL.revokeObjectURL(
          image.url
        );

      }

    }
  );


  removeListing();


  uploadedImages = [];


  imagePreview.innerHTML = "";


  imageCount.textContent =
    "0 images";


  analyzeButton.disabled =
    true;


  goHome();

}