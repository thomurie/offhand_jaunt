import datetime

# properDate(now, d=1)
# SET DATE
# validates date, ensures proper month/ year display
def properDate(date = datetime.datetime.now(), d = 5):
    d = int(date.strftime("%d")) + d
    m = int(date.strftime("%m"))
    y = int(date.strftime("%Y"))
    thirtyOne = [1, 3, 7, 8, 10, 12]

    if (d > 31):
        d = d - 31
        m +=1
    if (m > 12):
        m = m - 12
        y +=1

    if (m == 2 and d > 28):
        d = d - 28
        m += 1
    elif (thirtyOne.count(m) != 0 and d > 31):
        d = d - 31;

        if (m == 12):
            m = 1
            y +=1
        else:
            m +=1

    elif (d > 30):
        d = d - 30
        m += 1

    return datetime.datetime(y,m,d)

