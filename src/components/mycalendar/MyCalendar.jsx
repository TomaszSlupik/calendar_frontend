import React, { useState, useEffect } from 'react'; 
import './MyCalendar.scss'
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import { Button, ThemeProvider } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import themeColor from '../../theme/themeColor';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MyCalendar() {


    const [myCalendar, setMyCalendar] = useState([]) // Mój kalendarz z PostreSql

    // Stany do wprowadzenia danych do kalendarza
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // 1 dzień do przodu

    const [myDate, setMyDate] = useState(tomorrow.toISOString().split('T')[0])
    const [myTraining, setMyTraining] = useState()
    const [myTime, setMyTime] = useState(0)

    // Pobranie danych z Postgresql
    const fetchCalendar = async () => {
      try {
        const response = await fetch('http://localhost:5000/');
    
        if (response.ok) {
          const data = await response.json();
          setMyCalendar(data); 
          console.log('Jest ok');
        }
      } catch (error) {
        console.error('Wystąpił błąd podczas żądania do serwera.', error);
      }
    };
    
    
    useEffect(() => {
      fetchCalendar();
    }, []);
    
    // Zapis do bazy danych:
    const saveToPostgreSql = async (myDate, myTraining, myTime) => {
  
        try {
          const res = await fetch (`http://localhost:5000/${myDate}`, {
            method: 'PUT', 
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              data:  myDate,
              training: myTraining,
              time: myTime
            }),
          })
          if (res.ok) {
            window.location.reload()
            console.log('Edycja nastąpiła poprawnie do bazy')
          }
          else {
            console.log('Błąd edycji danych do bazy')
          }
        }
        catch (error) {
            console.error(error)
        }
    }

    // Edycja widoku kalendarza:
    const [openViewCalendar, setOpenViewCalendar] = useState(false)
    const [editDate, setEditDate] = useState()
    const [editTraining, setEditTraining] = useState()
    const [editTime, setEditTime] = useState()

    const editCalendarView = async (myDate, myTraining, myTime) => {
      setEditDate(myDate)
      setEditTraining(myTraining)
      setEditTime(myTime)
      setOpenViewCalendar(true)
    }

    const closeEditCalendarView = () => {
      setOpenViewCalendar(false)
    }

    const acceptEditCalendarView = async () => {
      saveToPostgreSql(editDate, editTraining, editTime)
      setOpenViewCalendar(false)

    }

    // Komponenty dla Tabeli kalendarza
    const VirtuosoTableComponents = {
        Scroller: React.forwardRef((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} />
        )),
    };
      
      function fixedHeaderContent() {
        return (
          <TableRow style={{width: '100%', backgroundColor: 'gray'}}>
            <TableCell variant="head" align="left" style={{fontWeight: 'bold', width: 300}}>
              Data
            </TableCell>
            <TableCell variant="head" align="left" style={{fontWeight: 'bold', width: '25%'}}>
              Tydzień
            </TableCell>
            <TableCell variant="head" align="left" style={{fontWeight: 'bold', width: '25%'}}>
              Trening
            </TableCell>
            <TableCell variant="head" align="right" style={{fontWeight: 'bold', width: '25%'}}>
              Czas
            </TableCell>
            <TableCell variant="head" align="right" style={{fontWeight: 'bold', width: '25%'}}>
              Filtr
            </TableCell>
          </TableRow>
        );
      }

      // Konwert daty
      function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
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
        const daysOfWeek = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
        const date = new Date(isoDate);
        const dayOfWeek = date.getDay();
        return daysOfWeek[dayOfWeek];
      }
    
      function rowContent(index, row) {
        return (
          <React.Fragment>
            <TableCell align="left" style={{width: '25%'}}>
              {formatDate(row.data)}
            </TableCell>
            <TableCell align="left" style={{ width: '25%' }}>
              {getDayName(row.data)} 
            </TableCell>
            <TableCell align="left" style={{width: '25%'}}>
              {row.training}
            </TableCell>
            <TableCell align="right" style={{width: '25%'}}>
              {row.time}
            </TableCell>
            <TableCell align="right" style={{width: '25%'}}>
              <EditCalendarIcon 
              onClick={() => editCalendarView(formatDate(row.data), row.training, row.time)}
              style={{cursor: 'pointer'}}
              />
            </TableCell>
          </React.Fragment>
        );
      }

  return (
    <div className='mycalendar'>
        <div className="mycalendar__add">
          <ThemeProvider
          theme={themeColor}
          >
             <Paper>
          <label for="start">Wprowadź datę:</label>
          <input 
          type="date" id="start" name="trip-start" value={myDate}
          onChange={(e) => setMyDate(e.target.value)}
          />
          <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Trening</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={myTraining}
                label="Training"
                onChange={(e) => setMyTraining(e.target.value)}
              >
                <MenuItem value={'Pływanie'}>Pływanie</MenuItem>
                <MenuItem value={'Rower'}>Rower</MenuItem>
                <MenuItem value={'Bieg'}>Bieg</MenuItem>
                <MenuItem value={'Siłownia'}>Siłownia</MenuItem>
              </Select>
          </FormControl>

          <TextField
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

          <Button
          variant='contained'
          onClick={() => saveToPostgreSql(myDate, myTraining, myTime)}
          >
            Zapisz
          </Button>
          </Paper>
          </ThemeProvider>
         
        </div>
        <div className="mycalendar__table">
            <div className="mycalendar__table-header">Kalendarz</div>
            <Paper style={{ height: 400, width: '100%', overflow: 'auto' }}>
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
                      <MenuItem value={'Pływanie'}>Pływanie</MenuItem>
                      <MenuItem value={'Rower'}>Rower</MenuItem>
                      <MenuItem value={'Bieg'}>Bieg</MenuItem>
                      <MenuItem value={'Siłownia'}>Siłownia</MenuItem>
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
              <Button onClick={closeEditCalendarView}>Anuluj</Button>
              <Button onClick={acceptEditCalendarView}>Akceptuję</Button>
            </DialogActions>
          </Dialog>
        </div>
    </div>
  )
}
