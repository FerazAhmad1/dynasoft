import React from "react";
import Dynamsoft from "dwt";
import "./dwt.css";

export default class DWT extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pixel: "",
      autofeader: false,
      showUi: false,
    };
  }
  DWObject = null;
  containerId = "dwtcontrolContainer";
  containerId1 = "dwtcontrolContainer2";
  componentDidMount() {
    Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", () => {
      this.Dynamsoft_OnReady();
    });
    Dynamsoft.DWT.ProductKey =
      "t0186SwUAAJlESpYZQDNsUhfvsGYGwTbBYCRyqcT7+E6OHFxFLUgCcGkZ2vZRkhyRlCbOAiSAFLQpw+bEpMqkxTkB0Dh4ZfvSPbtHSctttHpdi6O2RxMtDU1C4KvdAq9QDnH+Ep4ub9gD7wDotiAbQDkQ29kBH11vS4YE4BqgFSAmXQR+Nnmc2lIfUsPZeFF0cgOn3u/MN/YeZ76u/zrnXZ2HKJOCxghQPuUE4BqgFSAGkADmnEAcfwEF3Quc";
    Dynamsoft.DWT.ResourcesPath = "/dwt-resources";
    Dynamsoft.DWT.Containers = [
      {
        WebTwainId: "dwtObject",
        ContainerId: this.containerId,
        Width: "300px",
        Height: "400px",
      },
    ];
    Dynamsoft.DWT.Load();
  }
  Dynamsoft_OnReady() {
    this.DWObject = Dynamsoft.DWT.GetWebTwain(this.containerId);
    this.DWObject.Viewer.setViewMode(2, 2);
    // this.DWObject.Invert();
  }

  clickHandler() {
    this.DWObject.ConvertToGrayScale(
      0,
      () => {
        console.log("i am convertTogray");
      },
      (errorCode, errorString) => {
        console.log(errorCode, errorString);
      }
    );
    this.DWObject.Rotate(1, 45);
  }

  pixelChangeHandler(e) {
    console.log(e);
    if (e.target.value == "grey") {
      this.DWObject.ConvertToGrayScale(
        this.DWObject.CurrentImageIndexInBuffer,
        () => {
          console.log("i am convertTogray");
        },
        (errorCode, errorString) => {
          console.log(errorCode, errorString);
        }
      );
    } else if (e.target.value == "Black&white") {
      this.DWObject.ConvertToBW(
        this.DWObject.CurrentImageIndexInBuffer,
        () => console.log("success"),
        (errorCode, errorString) => console.log(errorCode, errorString)
      );
    } else if (e.target.value == "color") {
    }

    this.setState((prevState) => ({ ...prevState, pixel: e.target.value }));
  }

  /**
   * Upload the images specified by their indices in the specified file type.
   * @param indices Specify the images
   * @param type Specify the file type
   */
  upload(indices, type) {
    var protocol = Dynamsoft.Lib.detect.ssl ? "https://" : "http://",
      port = window.location.port === "" ? 80 : window.location.port,
      actionPage = "/upload.aspx";
    // path to the server-side script
    var url = protocol + window.location.hostname + ":" + port + actionPage;
    var fileName = "SampleFile" + this.getExtension(type);
    if (this.DWObject) {
      this.DWObject.HTTPUpload(
        url,
        indices,
        type,
        Dynamsoft.DWT.EnumDWT_UploadDataFormat.Binary,
        fileName,
        function () {
          console.log("Success");
        },
        function (errCode, errString, responseStr) {
          console.log(errString);
        }
      );
    }
  }
  /**
   * Return the extension string of the specified image type.
   * @param type The image type (number).
   */
  getExtension(type) {
    switch (type) {
      case 0:
        return ".bmp";
      case 1:
        return ".jpg";
      case 2:
        return ".tif";
      case 3:
        return ".png";
      case 4:
        return ".pdf";
      case 7:
      case 8:
      default:
        return ".unknown";
    }
  }

  acquireImage() {
    if (this.DWObject) {
      this.DWObject.SelectSourceAsync()
        .then(() => {
          return this.DWObject.AcquireImageAsync({
            IfDisableSourceAfterAcquire: true,
          });
        })
        .then((result) => {
          console.log(result);
        })
        .catch((exp) => {
          console.error(exp.message);
        })
        .finally(() => {
          this.DWObject.CloseSourceAsync().catch((e) => {
            console.error(e);
          });
        });
    }
  }
  render() {
    return (
      <div className="UI">
        <div id={this.containerId}> </div>
        <div className="sideBox">
          <h1>Select Source:</h1>
          <select>
            <option>TWAIN2 FreeImage software </option>
          </select>
          <div className="all_checkbox_radiobox">
            <div className="firstlevel">
              <label>
                <input type="checkbox" onChange={this.changeHandler} />
                Show UI
              </label>
              <label>
                <input type="checkbox" onChange={this.changeHandler} />
                AutoFeeder
              </label>
            </div>

            <div className="pixel">
              <p>Pixel</p>
              <div className="pixel__label">
                <label htmlFor="Black&white">
                  {" "}
                  <input
                    type="radio"
                    id="Black&white"
                    name="pixel"
                    value="Black&white"
                    onChange={(e) => this.pixelChangeHandler(e)}
                  />
                  Black&white
                </label>
                <br />
                {console.log("I am running")}
                <label htmlFor="gray">
                  <input
                    type="radio"
                    id="gray"
                    name="pixel"
                    value="gray"
                    onChange={(e) => this.pixelChangeHandler(e)}
                  />
                  gray
                </label>
                <br />

                <label htmlFor="color">
                  <input
                    type="radio"
                    id="color"
                    name="pixel"
                    value="color"
                    onChange={(e) => this.pixelChangeHandler(e)}
                  />
                  color
                </label>
              </div>
            </div>

            <div className="resolution">
              <label>
                Resultion <input type="number" />
              </label>
            </div>
          </div>

          <button
            onClick={() => {
              //Save the scanned image(s) under 'Document1'.
              this.DWObject.CreateDocument("Document1");
              this.DWObject.OpenDocument("Document1"); //Need to call OpenDocument after CreateDocument.

              const successCallback = () => {
                console.log("successful");
                this.DWObject.SaveAllAsPDF(
                  "Image1",
                  () => console.log("success"),
                  (errorCode, errorString) =>
                    console.log(errorCode, errorString)
                );
              };
              function failureCallback(errorCode, errorString) {
                alert(errorString);
              }
              this.DWObject.AcquireImage(successCallback, failureCallback);
            }}
            className="btn">
            Scan & save 1
          </button>
          <button
            onClick={() => {
              //Need to call OpenDocument after CreateDocument.

              const successCallback = (...args) => {
                console.log(args);
                console.log("successful");

                for (let i = 0; i < this.DWObject.HowManyImagesInBuffer; i++) {
                  this.DWObject.SaveAsPDF(
                    `Image_${i + 1}`,
                    i,
                    () => console.log("success"),
                    (errorCode, errorString) =>
                      console.log(errorCode, errorString)
                  );
                }
              };
              function failureCallback(errorCode, errorString) {
                alert(errorString);
              }
              this.DWObject.AcquireImage(successCallback, failureCallback);
            }}
            className="btn">
            Scan & save 2
          </button>
          <button
            onClick={() => {
              const arr = this.DWObject.SelectAllImages();
              arr.forEach((el) => {
                if (!this.DWObject.IsBlankImage(el)) {
                  this.DWObject.RemoveImage(el);
                }
              });
            }}
            className="btn">
            Remove Blank Images
          </button>
          <button
            onClick={() => this.DWObject.RemoveAllImages()}
            className="btn">
            Remove All Images
          </button>
        </div>
      </div>
    );
  }
}

//RemoveImage(index: number)
