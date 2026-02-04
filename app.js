RunByOnload();

//LocalStrage内の書籍情報を表示
function RunByOnload() {
  const roadData = RoadLocalStrage();
  if (roadData.length === 0) {
    MakeEmptyState();
  }
  for (let obj of roadData) {
    MakeDiv(obj);
  }
}

//ISBNから書籍情報を検索
function GetData() {
  url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"; //GOOGLE API
  isbn = document.getElementById("ISBN").value;

  if (document.getElementById("ISBN").value == "") {
    MakeAlert("ISBNを入力してください");
    return;
  }

  let request = new XMLHttpRequest();
  request.open("GET", url + isbn);
  request.responseType = "json";
  request.send();
  request.onload = function () {
    const result = request.response;
    if (result["totalItems"] === 0) {
      MakeAlert("書籍情報が取得できませんでした。");
      document.getElementById("ISBN").value = "";
    } else if (result["items"][0]["volumeInfo"]["imageLinks"] == null) {
      MakeAlert("画像が見つかりませんでした");
    } else {
      document.getElementById("imagePlace").src =
        result["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
      document.getElementById("imageSrc").value =
        result["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
    }
    document.getElementById("title").value =
      result["items"][0]["volumeInfo"]["title"];
    document.getElementById("authors").value =
      result["items"][0]["volumeInfo"]["authors"];
    document.getElementById("detailLink").value =
      result["items"][0]["volumeInfo"]["infoLink"];
  };
}

//データ保存
function SaveData() {
  if (
    document.getElementById("title").value === "" ||
    document.getElementById("authors").value === ""
  ) {
    MakeAlert("有効な値を入力してください");
  } else {
    const bookInfo = {
      title: document.getElementById("title").value,
      authors: document.getElementById("authors").value,
      imgSrc: document.getElementById("imageSrc").value,
      infoLink: document.getElementById("detailLink").value,
      memo: document.getElementById("memo").value,
      uuid: uuid(),
    };

    //thumbnailがないときダミー画像挿入
    if (bookInfo.imgSrc === "") {
      bookInfo.imgSrc = "images/noimage.png";
    }

    //エンプティステート削除
    DeleteEmptyState();
    //書籍情報を生成
    MakeDiv(bookInfo);
    //localStrageに保存
    const roadData = RoadLocalStrage();
    roadData.push(bookInfo);
    localStorage.setItem(`bookData`, JSON.stringify(roadData));

    ClearInputArea();
    //モーダルウィンドウを閉じる
    var myModalEl = document.getElementById("inputModal");
    var modal = bootstrap.Modal.getOrCreateInstance(myModalEl);
    modal.hide();
  }
}

function RoadLocalStrage() {
  if (localStorage.length == 0) {
    const arr = [];
    localStorage.setItem(`bookData`, JSON.stringify(arr));
    return arr;
  } else {
    const roadData = JSON.parse(localStorage.getItem("bookData"));
    return roadData;
  }
}

//書籍情報を生成
function MakeDiv(obj) {
  const container = document.getElementById("bookshelf");
  const newDiv = document.createElement("div");
  newDiv.innerHTML = `          
  <div class="col" id="${obj.uuid}">
      <img src="${obj.imgSrc}" class="img-thumbnail float-start " id="bookThumbnail" alt="bookThumbnail">
      <h5>${obj.title}</h5>
      <h6 class="text-body-secondary">${obj.authors}</h6>
      <a class="btn outline " href="${obj.infoLink}" target="_blank" rel="noopener noreferrer" role="button"><i class="bi bi-info-circle"></i></a>
      <button class="btn btn-outline-danger" id="${obj.uuid}"onclick="DeleteData(this.id);"><i class="bi bi-trash"></i></button>
      <div class="overflow-auto">
        <p>${obj.memo}</p>
      </div>
  </div> `;
  container.appendChild(newDiv);
}

//アラート生成
function MakeAlert(alertMassage) {
  const alertDiv = document.getElementById("alertArea");
  const alert = document.createElement("div");
  alert.innerHTML = `
  <div class="alert alert-danger alert-dismissible fade show" role="alert" id="alert" >
    ${alertMassage}
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
  alertDiv.appendChild(alert);
}

//全データ削除
function Clear() {
  localStorage.clear();
  ClearInputArea();
  ClearBookShelf();
  MakeEmptyState();
}

//個別データ削除
function DeleteData(uuid) {
  const roadData = JSON.parse(localStorage.getItem("bookData"));
  const deleteTargetIndex = roadData.findIndex(
    (bookData) => bookData.uuid === uuid,
  );
  roadData.splice(deleteTargetIndex, 1);
  localStorage.setItem(`bookData`, JSON.stringify(roadData));
  ClearBookShelf();
  RunByOnload();
}

//入力フォームクリア
function ClearInputArea() {
  document.getElementById("ISBN").value = "";
  document.getElementById("title").value = "";
  document.getElementById("authors").value = "";
  document.getElementById("imageSrc").value = "";
  document.getElementById("imagePlace").src = "";
  document.getElementById("detailLink").value = "";
  document.getElementById("memo").value = "";
  document.getElementById("alertArea").innerHTML = "";
}

//HTMLを削除
function ClearBookShelf() {
  const element = document.getElementById("bookshelf");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

//エンプティステートを生成
function MakeEmptyState() {
  const container = document.getElementById("pageTop");
  const newDiv = document.createElement("div");
  newDiv.innerHTML = `
    <div id="emptyInfo" class="container text-center position-absolute top-50 start-50 translate-middle d-block">
        <h2 class="text-body-secondary">読んだ本を登録してみましょう！</h2>
        <button type="button" class="btn main btn-lg" data-bs-toggle="modal" data-bs-target="#inputModal" id="openModalButton">
            登録
        </button>
    </div>`;
  container.appendChild(newDiv);
}

//エンプティステート削除
function DeleteEmptyState() {
  const container = document.getElementById("pageTop");
  container.innerHTML = "";
}

//一意なID(uuid)を生成
function uuid() {
  return URL.createObjectURL(new Blob()).slice(-36);
}

//以下バーコード読み取り機能 ------------------------------
const buttonCamera = document.querySelector("#quagga__cameraOn");

// buttonCameraがクリックされたら発火
buttonCamera.addEventListener("click", () => {
  // quagga.jsを使ってバーコードを読み取る関数
  isbnLoad();
});

// 初期設定
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
  //エラーハンドリング
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

  //API実行中の処理
  Quagga.onProcessed((result) => {
    var ctx = Quagga.canvas.ctx.overlay;
    var canvas = Quagga.canvas.dom.overlay;
    canvas.style.display = "none";
    ctx.clearRect(0, 0, parseInt(canvas.width), parseInt(canvas.height));
  });

  //バーコード発見時に走る処理
  Quagga.onDetected((result) => {
    const isbn = result.codeResult.code;
    if (isbn.includes("978")) {
      //ISBNかどうか判定
      document.getElementById("ISBN").value = isbn;
      ResetInput();
      GetData();
    }
  });
}

//カメラ映像を非表示
function ResetInput() {
  Quagga.stop();
  const liveStream = document.getElementById("quagga__livestream");
  liveStream.innerHTML = "";
}

//ページを閉じる際にAPIを止める処理
window.addEventListener("beforeunload", Quagga.stop());
const myModalEl = document.getElementById("inputModal");
myModalEl.addEventListener("hidden.bs.modal", (event) => {
  ResetInput();
});
