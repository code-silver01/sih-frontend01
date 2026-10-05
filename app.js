const API_URL = "http://localhost:5000/api/telemetry";

const history = [];


async function fetchTelemetry() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Backend returned an error");
        }

        const data = await response.json();

        updateDashboard(data);

        setConnection(true);

    } catch (error) {

        console.error(
            "Telemetry connection failed:",
            error
        );

        setConnection(false);
    }
}


/* =========================
   UPDATE DASHBOARD
========================= */

function updateDashboard(data) {

    const telemetry = data.telemetry;

    if (!telemetry) {
        return;
    }


    /*
        DEVICE
    */

    document.getElementById("recordId").textContent =
        telemetry.record_id ?? "--";


    /*
        DS18B20
    */

    document.getElementById("temperature").textContent =
        Number(telemetry.ds18b20_temp).toFixed(2);


    /*
        DHT22 TEMPERATURE
    */

    document.getElementById("dht22Temperature").textContent =
        Number(telemetry.dht22_temp).toFixed(2);


    /*
        HUMIDITY
    */

    document.getElementById("humidity").textContent =
        Number(telemetry.humidity).toFixed(2);


    /*
        MOTION
    */

    const motionElement =
        document.getElementById("motion");

    if (telemetry.motion) {

        motionElement.textContent =
            "DETECTED";

    } else {

        motionElement.textContent =
            "CLEAR";
    }


    /*
        ML STATUS
    */

    const mlStatus =
        document.getElementById("mlStatus");

    const systemStatus =
        document.getElementById("systemStatus");


    const status =
        telemetry.ml_status || "--";


    mlStatus.textContent = status;


    if (status === "ANOMALY") {

        mlStatus.className =
            "status-anomaly";

        systemStatus.textContent =
            "ANOMALY";

        systemStatus.className =
            "system-badge status-anomaly";

    } else {

        mlStatus.className =
            "status-normal";

        systemStatus.textContent =
            "NORMAL";

        systemStatus.className =
            "system-badge status-normal";
    }


    /*
        ACCELEROMETER
    */

    document.getElementById("accX").textContent =
        Number(telemetry.acc_x).toFixed(3);

    document.getElementById("accY").textContent =
        Number(telemetry.acc_y).toFixed(3);

    document.getElementById("accZ").textContent =
        Number(telemetry.acc_z).toFixed(3);


    /*
        GYROSCOPE
    */

    document.getElementById("gyroX").textContent =
        Number(telemetry.gyro_x).toFixed(3);

    document.getElementById("gyroY").textContent =
        Number(telemetry.gyro_y).toFixed(3);

    document.getElementById("gyroZ").textContent =
        Number(telemetry.gyro_z).toFixed(3);


    /*
        TIME
    */

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();


    /*
        RAW TELEMETRY
    */

    document.getElementById("rawData").textContent =
        JSON.stringify(
            telemetry,
            null,
            2
        );


    /*
        HISTORY
    */

    updateHistory(telemetry);
}


/* =========================
   HISTORY
========================= */

function updateHistory(telemetry) {

    const recordId =
        telemetry.record_id;


    const alreadyExists =
        history.some(
            item =>
                item.record_id === recordId
        );


    if (!alreadyExists) {

        history.unshift({

            record_id:
                recordId,

            ds18b20_temp:
                telemetry.ds18b20_temp,

            dht22_temp:
                telemetry.dht22_temp,

            humidity:
                telemetry.humidity,

            motion:
                telemetry.motion,

            ml_status:
                telemetry.ml_status

        });


        /*
            Keep last 20 records
        */

        if (history.length > 20) {

            history.pop();

        }
    }


    renderHistory();
}


/* =========================
   TABLE
========================= */

function renderHistory() {

    const table =
        document.getElementById(
            "telemetryTable"
        );


    if (history.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Waiting for telemetry...
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        history.map(item => {

            const statusClass =
                item.ml_status === "ANOMALY"
                    ? "status-anomaly"
                    : "status-normal";


            return `
                <tr>

                    <td>
                        ${item.record_id}
                    </td>

                    <td>
                        ${Number(
                            item.ds18b20_temp
                        ).toFixed(2)} °C
                    </td>

                    <td>
                        ${Number(
                            item.dht22_temp
                        ).toFixed(2)} °C
                    </td>

                    <td>
                        ${Number(
                            item.humidity
                        ).toFixed(2)} %
                    </td>

                    <td>
                        ${
                            item.motion
                                ? "DETECTED"
                                : "CLEAR"
                        }
                    </td>

                    <td class="${statusClass}">
                        ${item.ml_status}
                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================
   CONNECTION STATUS
========================= */

function setConnection(
    connected
) {

    const dot =
        document.querySelector(
            ".nav-dot"
        );


    const text =
        document.getElementById(
            "connectionText"
        );


    const tableStatus =
        document.getElementById(
            "tableStatus"
        );


    if (connected) {

        dot.style.background =
            "#58d47a";

        text.textContent =
            "BACKEND ONLINE";

        tableStatus.textContent =
            "LIVE";

        tableStatus.style.color =
            "#58d47a";

    } else {

        dot.style.background =
            "#ff6565";

        text.textContent =
            "BACKEND OFFLINE";

        tableStatus.textContent =
            "OFFLINE";

        tableStatus.style.color =
            "#ff6565";
    }
}


/* =========================
   START
========================= */

fetchTelemetry();


/*
    Refresh every 2 seconds
*/

setInterval(
    fetchTelemetry,
    2000
);