let uploadedImages = [];
let onlineListing = null;

const pages = [
  "homePage",
  "uploadPage",
  "analysisPage",
  "resultsPage",
  "reportPage"
];

const $ = id => document.getElementById(id);

const homePage = $("homePage");
const uploadPage = $("uploadPage");
const analysisPage = $("analysisPage");
const resultsPage = $("resultsPage");
const reportPage = $("reportPage");

const uploadArea = $("uploadArea");
const imageInput = $("imageInput");
const listingInput = $("listingInput");
const imagePreview = $("imagePreview");
const imageCount = $("imageCount");
const analyzeButton = $("analyzeButton");


/* Navigation */

function hidePages() {
  pages.forEach(id => $(id).classList.add("hidden"));
}

function showPage(id) {
  hidePages();
  $(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startInspection() {
  showPage("uploadPage");
}

function goHome() {
  showPage("homePage");
}

function scrollToHowItWorks() {
  $("howItWorks").scrollIntoView({ behavior: "smooth" });
}

function showResults() {
  showPage("resultsPage");
  renderResults();
}

function showReport() {
  showPage("reportPage");
  renderReport();
}


/* Package image upload */

uploadArea.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", e => {
  addImages(e.target.files);
});

uploadArea.addEventListener("dragover", e => {
  e.preventDefault();
  uploadArea.classList.add("dragging");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragging");
});

uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  uploadArea.classList.remove("dragging");
  addImages(e.dataTransfer.files);
});

function addImages(files) {
  [...files].forEach(file => {
    if (!file.type.startsWith("image/")) return;

    uploadedImages.push({
      file,
      url: URL.createObjectURL(file)
    });
  });

  imageInput.value = "";
  renderImages();
}

function renderImages() {
  const names = ["Front", "Back", "Side", "Additional"];

  imagePreview.innerHTML = uploadedImages.map((img, i) => `
    <div class="image-card">
      <img src="${img.url}" alt="${names[i] || "Package panel"}">
      <div class="image-info">
        <span>${names[i] || `Panel ${i + 1}`}</span>
        <button class="remove-btn" onclick="removeImage(${i})">Remove</button>
      </div>
    </div>
  `).join("");

  imageCount.textContent =
    `${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"}`;

  analyzeButton.disabled = uploadedImages.length === 0;
}

function removeImage(index) {
  const image = uploadedImages[index];

  if (image?.url) {
    URL.revokeObjectURL(image.url);
  }

  uploadedImages.splice(index, 1);
  renderImages();
}


/* Online listing */

listingInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  if (onlineListing?.url) {
    URL.revokeObjectURL(onlineListing.url);
  }

  onlineListing = {
    file,
    url: URL.createObjectURL(file)
  };

  renderListing();
});

function renderListing() {
  const preview = $("listingPreview");

  if (!onlineListing) {
    preview.classList.add("hidden");
    return;
  }

  $("listingImage").src = onlineListing.url;
  $("listingFileName").textContent = onlineListing.file.name;
  preview.classList.remove("hidden");
}

function removeListing() {
  if (onlineListing?.url) {
    URL.revokeObjectURL(onlineListing.url);
  }

  onlineListing = null;
  listingInput.value = "";
  renderListing();
}


/* Analysis */

async function analyzeProduct() {
  if (!uploadedImages.length) return;

  showPage("analysisPage");

  $("analysisLog").innerHTML = "";
  resetAnalysis();

  await runStep(
    1,
    "Reading package images and detecting text regions..."
  );

  await runStep(
    2,
    "Extracting declarations such as MRP, quantity, date and manufacturer..."
  );

  await runStep(
    3,
    onlineListing
      ? "Comparing package declarations with the online listing and checking machine-readable data..."
      : "Checking declarations and scanning for QR / barcode information..."
  );

  await runStep(
    4,
    "Building evidence-backed findings and preparing the inspection report..."
  );

  setTimeout(showResults, 500);
}

function resetAnalysis() {
  for (let i = 1; i <= 4; i++) {
    $(`step${i}`).classList.remove("active", "completed");
  }
}

function runStep(number, message) {
  return new Promise(resolve => {
    const step = $(`step${number}`);

    step.classList.add("active");
    addLog(message);

    setTimeout(() => {
      step.classList.remove("active");
      step.classList.add("completed");
      addLog("✓ Completed");
      resolve();
    }, 850);
  });
}

function addLog(message) {
  const line = document.createElement("p");
  line.textContent = `> ${message}`;
  $("analysisLog").appendChild(line);
}


/*
  Demo result for the current front-end prototype.
  Later this object can be replaced with data returned
  by the OCR + rule engine backend.
*/

const inspectionResult = {
  productName: "Example Packaged Commodity",

  status: "violation",

  message:
    "A cross-source discrepancy was detected. The package and online listing contain different MRP values. Manual verification is recommended.",

  declarations: [
    {
      name: "Product name",
      value: "Example Packaged Commodity",
      status: "pass"
    },
    {
      name: "Manufacturer / Packer",
      value: "ABC Foods Pvt. Ltd.",
      status: "pass"
    },
    {
      name: "Net Quantity",
      value: "500 g",
      status: "pass"
    },
    {
      name: "Maximum Retail Price (MRP)",
      value: "₹199",
      status: "violation"
    },
    {
      name: "Packing Date",
      value: "August 2026",
      status: "pass"
    },
    {
      name: "Consumer Care",
      value: "1800-XXX-XXXX",
      status: "pass"
    }
  ],

  comparisons: [
    {
      field: "MRP",
      package: "₹199",
      online: "₹249",
      status: "mismatch"
    },
    {
      field: "Net Quantity",
      package: "500 g",
      online: onlineListing ? "500 g" : "Not supplied",
      status: onlineListing ? "match" : "review"
    },
    {
      field: "Manufacturer",
      package: "ABC Foods Pvt. Ltd.",
      online: onlineListing ? "ABC Foods Pvt. Ltd." : "Not supplied",
      status: onlineListing ? "match" : "review"
    },
    {
      field: "QR / Barcode",
      package: "Detected",
      online: "Encoded information",
      status: "match"
    }
  ],

  findings: [
    {
      title: "MRP mismatch across sources",
      description:
        "The maximum retail price detected on the physical package differs from the value shown in the online listing.",
      status: "violation",
      evidence: "Package: ₹199 · Online listing: ₹249"
    },
    {
      title: "Machine-readable code detected",
      description:
        "A QR / barcode region was detected on the uploaded package and is available for verification.",
      status: "pass",
      evidence: "QR / barcode source: package image"
    },
    {
      title: "Physical readability requires verification",
      description:
        "Image-based screening cannot conclusively establish physical print-size compliance. An inspector should verify print height and placement.",
      status: "review",
      evidence: "Physical verification required"
    }
  ]
};


/* Results */

function renderResults() {
  $("productName").textContent = inspectionResult.productName;
  $("inspectionDate").textContent =
    `Inspected on ${new Date().toLocaleString()}`;

  renderOverall();
  renderSummary();
  renderDeclarations();
  renderComparisons();
  renderFindings();
}

function renderOverall() {
  const box = $("overallStatus");
  const title = $("overallTitle");
  const badge = $("overallBadge");

  box.className = `overall-status ${inspectionResult.status}`;

  if (inspectionResult.status === "pass") {
    title.textContent = "Compliant";
    badge.textContent = "Compliant";
    badge.style.background = "var(--pass)";
  } else if (inspectionResult.status === "review") {
    title.textContent = "Review Required";
    badge.textContent = "Review Required";
    badge.style.background = "var(--review)";
  } else {
    title.textContent = "Potential Discrepancy";
    badge.textContent = "Potential Violation";
    badge.style.background = "var(--danger)";
  }

  $("overallMessage").textContent = inspectionResult.message;
}

function renderSummary() {
  const matches = inspectionResult.comparisons.filter(
    x => x.status === "match"
  ).length;

  const reviews =
    inspectionResult.declarations.filter(x => x.status === "review").length +
    inspectionResult.comparisons.filter(x => x.status === "review").length;

  const violations =
    inspectionResult.declarations.filter(x => x.status === "violation").length +
    inspectionResult.comparisons.filter(x => x.status === "mismatch").length;

  $("summary").innerHTML = `
    <div class="summary-card">
      <span>DECLARATIONS</span>
      <strong>${inspectionResult.declarations.length}</strong>
    </div>
    <div class="summary-card">
      <span>MATCHES</span>
      <strong>${matches}</strong>
    </div>
    <div class="summary-card">
      <span>REVIEW</span>
      <strong>${reviews}</strong>
    </div>
    <div class="summary-card">
      <span>DISCREPANCIES</span>
      <strong>${violations}</strong>
    </div>
  `;
}

function statusBadge(status) {
  const label = {
    pass: "Pass",
    review: "Review",
    violation: "Potential Violation",
    mismatch: "Mismatch"
  }[status] || status;

  const cls = status === "mismatch" ? "violation" : status;

  return `<span class="badge ${cls}">${label}</span>`;
}

function renderDeclarations(target = "declarations") {
  $(target).innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Declaration</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${inspectionResult.declarations.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td>${statusBadge(item.status)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderComparisons(target = "comparisons") {
  $(target).innerHTML = `
    <div class="head">
      <span>FIELD</span>
      <span>PACKAGE</span>
      <span>ONLINE / CODE</span>
      <span>STATUS</span>
    </div>

    ${inspectionResult.comparisons.map(item => `
      <div>
        <span>${item.field}</span>
        <span>${item.package}</span>
        <span>${item.online}</span>
        <span>${statusBadge(item.status)}</span>
      </div>
    `).join("")}
  `;
}

function renderFindings(target = "findings") {
  $(target).innerHTML = inspectionResult.findings.map(item => `
    <div class="finding">
      <div class="finding-top">
        <strong>${item.title}</strong>
        ${statusBadge(item.status)}
      </div>

      <p>${item.description}</p>
      <div class="evidence">Evidence: ${item.evidence}</div>
    </div>
  `).join("");
}


/* Report */

function renderReport() {
  const date = new Date().toLocaleString();

  $("reportProduct").textContent = inspectionResult.productName;
  $("reportStatus").textContent = getStatusLabel();
  $("reportMessage").textContent = inspectionResult.message;
  $("reportDate").textContent = `Generated on ${date}`;

  $("reportDeclarations").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Declaration</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${inspectionResult.declarations.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td>${statusBadge(item.status)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  $("reportComparisons").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Field</th>
          <th>Package</th>
          <th>Online / Code</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${inspectionResult.comparisons.map(item => `
          <tr>
            <td>${item.field}</td>
            <td>${item.package}</td>
            <td>${item.online}</td>
            <td>${statusBadge(item.status)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  $("reportFindings").innerHTML = inspectionResult.findings.map(item => `
    <div class="finding">
      <div class="finding-top">
        <strong>${item.title}</strong>
        ${statusBadge(item.status)}
      </div>
      <p>${item.description}</p>
      <div class="evidence">Evidence: ${item.evidence}</div>
    </div>
  `).join("");
}

function getStatusLabel() {
  if (inspectionResult.status === "pass") return "Compliant";
  if (inspectionResult.status === "review") return "Review Required";
  return "Potential Violation";
}


/* Start with the home page */

hidePages();
homePage.classList.remove("hidden");