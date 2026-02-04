const buttonCamera = document.querySelector("#quagga__cameraOn");

// buttonCameraがクリックされたら発火
buttonCamera.addEventListener("click", () => {
  // quagga.jsを使ってバーコードを読み取る関数
  isbnLoad();
});

function isbnLoad() {
  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: document.querySelector("#quagga__livestream"),
        decodeBarCodeRate: 3,
        successTimeout: 500,
        codeRepetition: true,
        tryVertical: true,
        frameRate: 15,
        facingMode: "environment",
      },
      constraints: {
        facingMode: "environment",
      },
      decoder: {
        readers: ["ean_reader"],
      },
    },
    function (err) {
      if (err) {
        handleInitError(err);
        return;
      }
      console.log("Initialization finished. Ready to start");
      Quagga.start();
    },
  );

  function handleInitError(err) {
    console.error("初期化エラー:", err);

    if (err.name === "NotAllowedError") {
      alert(
        "カメラの使用が許可されていません。ブラウザの設定を確認してください。",
      );
    } else if (err.name === "NotFoundError") {
      alert(
        "カメラが見つかりません。デバイスにカメラが接続されているか確認してください。",
      );
    } else {
      alert("エラーが発生しました: " + err.message);
    }
  }

  Quagga.onProcessed((result) => {
    var ctx = Quagga.canvas.ctx.overlay;
    var canvas = Quagga.canvas.dom.overlay;
    canvas.style.display = "none";
    ctx.clearRect(0, 0, parseInt(canvas.width), parseInt(canvas.height));
  });

  Quagga.onDetected((result) => {
    const isbn = result.codeResult.code;
    if (isbn.includes("978")) {
      document.getElementById("ISBN").value = isbn;
      Quagga.stop();
    }
  });
}

function ResetInput() {
  Quagga.stop();
  const liveStream = document.getElementById("quagga__livestream");
  liveStream.innerHTML = "";
}

window.addEventListener("beforeunload", Quagga.stop());
const myModalEl = document.getElementById("inputModal");
myModalEl.addEventListener("hidden.bs.modal", (event) => {
  ResetInput();
});
