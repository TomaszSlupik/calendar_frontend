import React, { useState, useEffect } from "react";
import "./MyCalendar.scss";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso } from "react-virtuoso";
import { Button, ThemeProvider } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import Slide from "@mui/material/Slide";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import themeColor from "../../theme/themeColor";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function MyCalendar() {
  const [myCalendar, setMyCalendar] = useState([]); // Mój kalendarz z PostreSql

  // Stany do wprowadzenia danych do kalendarza
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // 1 dzień do przodu

  const [myDate, setMyDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [myTraining, setMyTraining] = useState();
  const [myTime, setMyTime] = useState(0);

  // Dane wprowadzone z sukcesem do kalendarza
  const [addSuccess, setAddSuccess] = useState(false);

  // Pobranie danych z Postgresql
  const fetchCalendar = async () => {
    try {
      const response = await fetch("http://localhost:5000/");

      if (response.ok) {
        const data = await response.json();
        setMyCalendar(data);
        console.log("Jest ok");
      }
    } catch (error) {
      console.error("Wystąpił błąd podczas żądania do serwera.", error);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  // Zapis do bazy danych:
  const saveToPostgreSql = async (myDate, myTraining, myTime) => {
    try {
      const res = await fetch(`http://localhost:5000/${myDate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: myDate,
          training: myTraining,
          time: myTime,
        }),
      });
      if (res.ok) {
        setAddSuccess(true);
        setTimeout(() => {
          setAddSuccess(false);
          window.location.reload();
        }, 1500);
        console.log("Edycja nastąpiła poprawnie do bazy");
      } else {
        console.log("Błąd edycji danych do bazy");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Edycja widoku kalendarza:
  const [openViewCalendar, setOpenViewCalendar] = useState(false);
  const [editDate, setEditDate] = useState();
  const [editTraining, setEditTraining] = useState();
  const [editTime, setEditTime] = useState();

  const editCalendarView = async (myDate, myTraining, myTime) => {
    setEditDate(myDate);
    setEditTraining(myTraining);
    setEditTime(myTime);
    setOpenViewCalendar(true);
  };

  const closeEditCalendarView = () => {
    setOpenViewCalendar(false);
  };

  const acceptEditCalendarView = async () => {
    saveToPostgreSql(editDate, editTraining, editTime);
    setOpenViewCalendar(false);
  };

  // Style
  const style = {
    tableRow: { width: "100%", backgroundColor: "gray" },
    tableHeadr: { fontWeight: "bold", width: 300 },
    table: { fontWeight: "bold", width: "25%" },
    tableCel: { width: "25%" },
    calendar: { cursor: "pointer" },
    paper: { height: 400, width: "100%", overflow: "auto" },
    paperView: { minHeight: "155px" },
    btnPaper: { position: "absolute", right: "3%", bottom: "10%" },
  };

  // Komponenty dla Tabeli kalendarza
  const VirtuosoTableComponents = {
    Scroller: React.forwardRef((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
  };

  function fixedHeaderContent() {
    return (
      <TableRow style={style.tableRow}>
        <TableCell variant="head" align="left" style={style.tableHeadr}>
          Data
        </TableCell>
        <TableCell variant="head" align="left" style={style.table}>
          Tydzień
        </TableCell>
        <TableCell variant="head" align="left" style={style.table}>
          Trening
        </TableCell>
        <TableCell variant="head" align="right" style={style.table}>
          Czas
        </TableCell>
        <TableCell variant="head" align="right" style={style.table}>
          Filtr
        </TableCell>
      </TableRow>
    );
  }

  // Konwert daty
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Sortowanie po dacie
  function sortByDate(a, b) {
    return new Date(a.data) - new Date(b.data);
  }

  // Dzisiejszy dzień + 2 tygodnie do przodu
  function isTwoWeeks(date) {
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    return new Date(date) >= today && new Date(date) <= twoWeeksFromNow;
  }

  const filteredData = myCalendar.filter((row) => isTwoWeeks(row.data));

  // Dzień tygodnia
  function getDayName(isoDate) {
    const daysOfWeek = [
      "niedziela",
      "poniedziałek",
      "wtorek",
      "środa",
      "czwartek",
      "piątek",
      "sobota",
    ];
    const date = new Date(isoDate);
    const dayOfWeek = date.getDay();
    return daysOfWeek[dayOfWeek];
  }

  function rowContent(index, row) {
    return (
      <React.Fragment>
        <TableCell align="left" style={style.tableCel}>
          {formatDate(row.data)}
        </TableCell>
        <TableCell align="left" style={style.tableCel}>
          {getDayName(row.data)}
        </TableCell>
        <TableCell align="left" style={style.tableCel}>
          {row.training}
        </TableCell>
        <TableCell align="right" style={style.tableCel}>
          {row.time}
        </TableCell>
        <TableCell align="right" style={style.tableCel}>
          <EditCalendarIcon
            onClick={() =>
              editCalendarView(formatDate(row.data), row.training, row.time)
            }
            style={style.calendar}
          />
        </TableCell>
      </React.Fragment>
    );
  }

  return (
    <div className="mycalendar">
      <div className="mycalendar__add">
        <ThemeProvider theme={themeColor}>
          <Paper style={style.paperView}>
            <label className="mycalendar__add-date" for="start">
              Wprowadź datę:{" "}
            </label>
            <input
              className="mycalendar__add-input"
              type="date"
              id="start"
              name="trip-start"
              value={myDate}
              onChange={(e) => setMyDate(e.target.value)}
            />
            <div className="mycalendar__add-training">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Trening</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={myTraining}
                  label="Training"
                  onChange={(e) => setMyTraining(e.target.value)}
                >
                  <MenuItem value={"Pływanie"}>Pływanie</MenuItem>
                  <MenuItem value={"Rower"}>Rower</MenuItem>
                  <MenuItem value={"Bieg"}>Bieg</MenuItem>
                  <MenuItem value={"Siłownia"}>Siłownia</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="mycalendar__add-time">
              <TextField
                style={{ width: "100%" }}
                id="standard-number"
                label="Czas"
                type="number"
                value={myTime}
                onChange={(e) => setMyTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            </div>
            <Button
              style={style.btnPaper}
              variant="contained"
              onClick={() => saveToPostgreSql(myDate, myTraining, myTime)}
            >
              Zapisz
            </Button>
          </Paper>
        </ThemeProvider>

        <Stack spacing={2} sx={{ width: "100%" }}>
          <Snackbar open={addSuccess} autoHideDuration={6000}>
            <Alert severity="success" sx={{ width: "100%" }}>
              Dane zostały wprowadzone do kalendarza
            </Alert>
          </Snackbar>
        </Stack>
      </div>
      <div className="mycalendar__table">
        <div className="mycalendar__table-header">Kalendarz</div>
        <Paper style={style.paper}>
          <TableVirtuoso
            data={filteredData.sort(sortByDate)}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
          />
        </Paper>

        <Dialog
          open={openViewCalendar}
          TransitionComponent={Transition}
          keepMounted
          onClose={closeEditCalendarView}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{`Kalendarz: ${editDate}`}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Trening</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={editTraining}
                  label="Training"
                  onChange={(e) => setEditTraining(e.target.value)}
                >
                  <MenuItem value={"Pływanie"}>Pływanie</MenuItem>
                  <MenuItem value={"Rower"}>Rower</MenuItem>
                  <MenuItem value={"Bieg"}>Bieg</MenuItem>
                  <MenuItem value={"Siłownia"}>Siłownia</MenuItem>
                </Select>
              </FormControl>

              <TextField
                id="standard-number"
                label="Czas"
                type="number"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={closeEditCalendarView}>
              Anuluj
            </Button>
            <Button variant="contained" onClick={acceptEditCalendarView}>
              Akceptuję
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
