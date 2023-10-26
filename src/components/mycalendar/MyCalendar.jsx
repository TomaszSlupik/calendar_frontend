import React, { useState, useEffect } from 'react'; 
import './MyCalendar.scss'
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import { Button } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function MyCalendar() {


    const [myCalendar, setMyCalendar] = useState([]) // Mój kalendarz z PostreSql

    // Stany do wprowadzenia danych do kalendarza
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // 1 dzień do przodu

    const [myDate, setMyDate] = useState(tomorrow.toISOString().split('T')[0])
    const [myTraining, setMyTraining] = useState()

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
    const saveToPostgreSql = async (myDate, myTraining) => {
        console.log(myDate, myTraining)
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
          </React.Fragment>
        );
      }

  return (
    <div className='mycalendar'>
        <div className="mycalendar__add">
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
                <MenuItem value={'Siłownia'}>Siłowniaa</MenuItem>
              </Select>
          </FormControl>
          <Button
          variant='outlined'
          onClick={() => saveToPostgreSql(myDate, myTraining)}
          >
            Zapisz
          </Button>
          </Paper>
        </div>
        <div className="mycalendar__table">
            <div>Kalendarz</div>
            <Paper style={{ height: 400, width: '100%', overflow: 'auto' }}>
                <TableVirtuoso
                data={myCalendar}
                components={VirtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
                />
            </Paper>
        </div>
    </div>
  )
}
