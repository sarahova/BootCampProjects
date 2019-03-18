Sub Stocks():

For Each ws In Worksheets
    
    'PART 1: Create Table of Unique Tickers, Yearly Change, Percent Change and Total Stock Volume
    'Define Variables
    Dim LastRow As Long
    LastRow = ws.Cells(Rows.Count, 1).End(xlUp).Row
    Dim Stock_Total As Double
    Stock_Total = 0
    Dim Ticker As String
    Dim Open_Year_Value As Double
    Open_Year_Value = 0
    Dim Close_Year_Value As Double
    Close_Year_Value = 0
    Dim Difference As Double
    Dim Percent_Change As Double


    'Sort All sheets, sort by Ticker and then by Date
    With ws.Sort
         .SortFields.Add Key:=ws.Range("A1"), Order:=xlAscending
         .SortFields.Add Key:=ws.Range("B1"), Order:=xlAscending
         .SetRange ws.Range("A1:G" & LastRow)
         .Header = xlYes
         .Apply
    End With
    
    'Fill in Table Headers
    ws.Cells(1, 9).Value = "Tickers"
    ws.Cells(1, 9).Font.Bold = True
    ws.Cells(1, 10).Value = "Yearly Change"
    ws.Cells(1, 10).Font.Bold = True
    ws.Cells(1, 11).Value = "Percent Change"
    ws.Cells(1, 11).Font.Bold = True
    ws.Cells(1, 12).Value = "Total Stock Volume"
    ws.Cells(1, 12).Font.Bold = True
    
    i = 2
    'loop through source data
    For j = 2 To LastRow
            
        'cumulatively add Stock Total (Rolling Stock Total)
        Stock_Total = Stock_Total + ws.Cells(j, 7).Value
        
        'If cell in first column does not equal the cell above, then assign Open_Year_Value
        If ws.Cells(j, 1).Value <> ws.Cells(j - 1, 1).Value Then
            Open_Year_Value = ws.Cells(j, 3).Value
               
        'loops through source data to get unique ticker values: If cell does not equal cell after then assign that cell Value as unique ticker and output to new table
        ElseIf ws.Cells(j, 1).Value <> ws.Cells(j + 1, 1).Value Then
            Ticker = ws.Cells(j, 1).Value
            ws.Cells(i, 9).Value = Ticker
            'add total stock volume to output table by unique ticker and reinitialize Stock_Total counter
            ws.Cells(i, 12).Value = Stock_Total
            Stock_Total = 0
            'assign Close_Year_value
            Close_Year_Value = ws.Cells(j, 6).Value
            'Calculate Difference and populate in output table
            Difference = Close_Year_Value - Open_Year_Value
            ws.Cells(i, 10).Value = Difference
                'In output table, color yearly difference cells as red for negative changes and green for positive changes
                If ws.Cells(i, 10).Value > 0 Then
                ws.Cells(i, 10).Interior.ColorIndex = 4
                ElseIf ws.Cells(i, 10).Value <= 0 Then
                ws.Cells(i, 10).Interior.ColorIndex = 3
                End If
                'calculate percent difference and populate in output table. Protect for dividing by zero
                If Open_Year_Value = 0 Then
                ws.Cells(i, 11).Value = "N/A"
                Else
                Percent_Change = Difference / Open_Year_Value
                ws.Cells(i, 11).Value = Percent_Change
                ws.Cells(i, 11) = Format(Percent_Change, "Percent")
                End If
                
            'increment i
            i = i + 1
        End If
    
    Next j
   
    'PART 2: Create Table for Greatest Percent Increase, Greatest Percent Decrease, Greatest Total Volume
    
    'Fill in table Headers
    ws.Range("N2").Value = "Greatest Percent Increase"
    ws.Range("N2").Font.Bold = True
    ws.Range("N3").Value = "Greatest Percent Decrease"
    ws.Range("N3").Font.Bold = True
    ws.Range("N4").Value = "Greatest Total Stock Volume"
    ws.Range("N4").Font.Bold = True
    ws.Range("O1").Value = "Ticker"
    ws.Range("O1").Font.Bold = True
    ws.Range("P1").Value = "Value"
    ws.Range("P1").Font.Bold = True
    
    'Define Variables
    Dim Max As Double
    Dim MaxTicker As String
    Dim Min As Double
    Dim MinTicker As String
    Dim LastRowI As Integer
    LastRowI = ws.Range("I" & Rows.Count).End(xlUp).Row
    Dim MaxVolume As Double
    Dim MaxVolumeTicker As String
    
    'Initialize variables with starting values and populate in table
    MaxVolume = ws.Cells(2, 12).Value
    MaxVolumeTicker = ws.Cells(2, 9).Value
    Max = ws.Cells(2, 11).Value
    Min = ws.Cells(2, 11).Value
    MaxTicker = ws.Cells(2, 9).Value
    MinTicker = ws.Cells(2, 9).Value
    ws.Range("P2").Value = Max
    ws.Range("O2").Value = MaxTicker
    ws.Range("P3").Value = Min
    ws.Range("O3").Value = MinTicker
    ws.Range("O4").Value = MaxVolumeTicker
    ws.Range("P4").Value = MaxVolume
    
    'Loop through table of Unique Tickers and pull maximum and minimum percent changes and greatest total volume
    i = 3
    Do While (i <= LastRowI)
        'Get max percent change, format as percent, and populate value in table
        'Need to protect for if Max="N/A" becuase then it turns to string and can't compare double to string
        If ws.Cells(i, 11).Value = "N/A" Then
            i = i + 1
            GoTo ProtectNA
        End If
        
        If ws.Cells(i, 11).Value > Max Then
            Max = ws.Cells(i, 11).Value
            MaxTicker = ws.Cells(i, 9).Value
            ws.Range("P2").Value = Max
            ws.Range("O2").Value = MaxTicker
        'Get min percent change, format as percent, and populate value in table
        ElseIf ws.Cells(i, 11).Value < Min Then
            Min = ws.Cells(i, 11).Value
            MinTicker = ws.Cells(i, 9).Value
            ws.Range("P3").Value = Min
            ws.Range("P3") = Format(Min, "Percent")
            ws.Range("O3").Value = MinTicker
        End If
        'Get max total volume, populate in table
        If ws.Cells(i, 12).Value > MaxVolume Then
            MaxVolume = ws.Cells(i, 12).Value
            MaxVolumeTicker = ws.Cells(i, 9).Value
            ws.Range("O4").Value = MaxVolumeTicker
            ws.Range("P4").Value = MaxVolume
        End If
        'increment i
        i = i + 1
        
        'Formating new table
        ws.Range("P2") = Format(Max, "Percent")
        ws.Range("P3") = Format(Min, "Percent")
        ws.Range("P4").NumberFormat = "0"
        
ProtectNA:
    
    Loop

Next ws

End Sub

