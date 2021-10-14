// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;

const kCalName = "<YOUR_CAL_HERE>";
const kReminderListName = "<YOUR_REMINDER_LIST_HERE>";
const kDayColor = "#c35b22";
const kWeekendColor = "#d19847";
const kMainBackgroundColor = "#1C1C1E";
const kRemindersBackgroundColor = "#EEEEEE";
const kCalendarBackgroundColor = "#2C2C2E";

const dF = new DateFormatter();

let w = new ListWidget();
w.setPadding(8, 8, 8, 8);

let mainStack = w.addStack();
mainStack.layoutVertically();

// Top drawer - calendar and reminders
var topStack = mainStack.addStack();
var topLeftStack = topStack.addStack();
topLeftStack.layoutVertically();
await generateCalendar(topLeftStack);

topStack.addSpacer();

var topRightStack = topStack.addStack();
topRightStack.layoutVertically();
await generateReminders(topRightStack);

mainStack.addSpacer(8);

// Bottom drawer - events
var bottomStack = mainStack.addStack();
bottomStack.layoutVertically();
bottomStack.size = new Size(325, 170);
await generateEventsList(bottomStack);

w.backgroundColor = new Color(kMainBackgroundColor);
Script.setWidget(w);
Script.complete();
w.presentLarge();

/////////////////////////////////////////
////////// AUXILIARY FUNCTIONS //////////
/////////////////////////////////////////

async function generateCalendar(stack) {
  stack.backgroundColor = new Color(kCalendarBackgroundColor);
  stack.cornerRadius = 15;
  stack.setPadding(5, 5, 5, 5);

  var mthStack = stack.addStack();
  mthStack.layoutVertically();

  const oDate = new Date(2001, 00, 01).getTime();
  const date = new Date();

  const calendarStack = mthStack.addStack();
  calendarStack.spacing = -1;

  const month = buildMonthVertical();
  for (let i = 0; i < month.length; i += 1) {
    let weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();

    for (let j = 0; j < month[i].length; j += 1) {
      let dateStack = weekdayStack.addStack();
      let dateStackUp = dateStack.addStack();
      dateStackUp.size = new Size(22, 14);
      dateStackUp.centerAlignContent();
      dateStack.size = new Size(22, 20);

      var nextMonth = false,
        prevMonth = false;
      if (j == 1 && month[i][j] > 10) prevMonth = true;
      if (j > 3 && month[i][j] < 10) nextMonth = true;

      if (
        month[i][j] === date.getDate().toString() &&
        !prevMonth &&
        !nextMonth
      ) {
        const highlightedDate = getHighlightedDate(date.getDate().toString());
        dateStackUp.addImage(highlightedDate);
      } else {
        let color = kRemindersBackgroundColor;
        if (j == 0) {
          color = kDayColor;
        } else if ((i == 0) | (i == 6)) {
          color = kWeekendColor;
        }

        const textLine = dateStackUp.addText(month[i][j] + "");
        textLine.font = Font.boldSystemFont(10);
        textLine.textOpacity = prevMonth || nextMonth ? 0.3 : 1;
        textLine.textColor = new Color(color);
      }

      if (!isNaN(month[i][j])) {
        const nDate = new Date(
          date.getFullYear(),
          prevMonth
            ? date.getMonth() - 1
            : nextMonth
            ? date.getMonth() + 1
            : date.getMonth(),
          month[i][j],
          12,
          00
        );
        let diff = (nDate - oDate) / 1000;
        dateStack.url = "calshow:" + diff;
      }
      dateStack.layoutVertically();
      if (j == 0) {
        dateStack.addSpacer(2);
        let lineImg = dateStack.addImage(lineSeparator());
        lineImg.size = new Size(22, 1);
        lineImg.tintColor = Color.white();
        lineImg.imageOpacity = 0.1;
      }
    }
  }
}

/*
 *
 * Creates an array of arrays, where the inner arrays include the same weekdays
 * along with an identifier in 0 position
 * [
 *   [ 'M', ' ', '7', '14', '21', '28' ],
 *   [ 'T', '1', '8', '15', '22', '29' ],
 *   [ 'W', '2', '9', '16', '23', '30' ],
 *   ...
 * ]
 *
 * @returns {Array<Array<string>>}
 */
function buildMonthVertical() {
  const date = new Date();
  const firstDayStack = new Date(date.getFullYear(), date.getMonth(), 1); //monWeekStart?1:2);
  const lastDayStack = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let month, forLoopFirstDay, forLoopLastDay;
  month = [["D"], ["S"], ["T"], ["Q"], ["Q"], ["S"], ["S"]];

  forLoopFirstDay = firstDayStack.getDay();
  forLoopLastDay = lastDayStack.getDay();
  let dayStackCounter = 0;

  for (let i = 1; i <= forLoopFirstDay; i += 1) {
    let dateee = new Date(
      date.getFullYear(),
      date.getMonth(),
      0 - (forLoopFirstDay - i)
    );
    month[i - 1].push(dateee.getDate());
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  for (let date = 1; date <= lastDayStack.getDate(); date += 1) {
    month[dayStackCounter].push(`${date}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  let idx = 1;
  for (let i = forLoopLastDay + 1; i <= 6; i++) {
    let dateee = new Date(date.getFullYear(), date.getMonth() + 1, idx);
    idx += 1;
    month[i].push(dateee.getDate());
  }
  return month;
}

/**
 * Draws a circle with a date on it for highlighting in calendar view
 *
 * @param  {string} date to draw into the circle
 *
 * @returns {Image} a circle with the date
 */

function getHighlightedDate(date) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const size = 50;
  drawing.size = new Size(size, size);
  drawing.opaque = false;
  drawing.setFillColor(new Color(kDayColor));
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(30));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(kRemindersBackgroundColor));
  drawing.drawTextInRect(date, new Rect(0, 5, size, size));
  const currentDayImg = drawing.getImage();
  return currentDayImg;
}

function lineSeparator() {
  const context = new DrawContext();
  let width = 22,
    h = 1;
  context.size = new Size(width, h);
  context.opaque = false;
  context.respectScreenScale = true;
  const path = new Path();
  path.move(new Point(1, h));
  path.addLine(new Point(width, h));
  context.addPath(path);

  context.setStrokeColor(Color.white());
  context.strokePath();
  return context.getImage();
}

async function generateEventsList(stack) {
  const eventsArray = await CalendarEvent.today();
  const futureEventsArray = eventsArray
    .filter(
      (item) =>
        new Date(item.startDate).getTime() > new Date().getTime() &&
        kCalName == item.calendar.title
    )
    .sort((a, b) =>
      a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0
    )
    .slice(0, 3);

  const todayStack = stack.addStack();
  todayStack.size = new Size(325, 0);
  const todayHeader = todayStack.addText("TODAY");
  todayHeader.font = Font.boldMonospacedSystemFont(15);
  todayHeader.textColor = new Color(kDayColor);

  futureEventsArray.forEach((item) => addEntryToWidget(item, stack));

  if (futureEventsArray.length == 0) {
    stack.addSpacer();
    const noStack = stack.addStack();
    noStack.addSpacer();
    const noText = noStack.addText("No events");
    noText.font = Font.regularMonospacedSystemFont(16);
    noText.textOpacity = 0.5;
    noStack.addSpacer();
  }

  stack.addSpacer();
}

function addEntryToWidget(item, stack) {
  stack.addSpacer(7);
  const entryStack = stack.addStack();
  entryStack.layoutVertically();
  entryStack.borderWidth = 3;
  entryStack.borderColor = new Color(kWeekendColor);
  entryStack.cornerRadius = 22;
  entryStack.size = new Size(325, 0);
  entryStack.setPadding(7, 20, 7, 20);
  entryStack.url = "googlecalendar://";

  const entryTitle = entryStack.addText(item.title);
  entryTitle.font = Font.boldSystemFont(13);
  entryTitle.textColor = new Color(kWeekendColor);
  entryTitle.lineLimit = 1;

  dF.dateFormat = "HH:mm";
  const entryTime = entryStack.addText(
    dF.string(item.startDate) + " - " + dF.string(item.endDate)
  );
  entryTime.font = Font.semiboldSystemFont(11);
  entryTime.textColor = new Color(kWeekendColor);
  entryTime.textOpacity = 0.8;

  maybeDisplayAsAcceptedEvent(item, entryStack, entryTitle, entryTime);
}

function maybeDisplayAsAcceptedEvent(event, stack, title, time) {
  if (
    event.attendees &&
    event.attendees.find((attendee) => attendee.isCurrentUser).status ==
      "pending"
  ) {
    return;
  }

  stack.backgroundColor = new Color(kWeekendColor);
  title.textColor = new Color(kMainBackgroundColor);
  time.textColor = new Color(kMainBackgroundColor);
}

async function generateReminders(stack) {
  const reminders = await Reminder.allIncomplete();
  const tasks = reminders.filter(
    (reminder) => reminder.calendar.title == kReminderListName
  );

  stack.backgroundColor = new Color(kRemindersBackgroundColor);
  stack.cornerRadius = 15;
  stack.setPadding(2, 8, 1, 0);
  stack.url = "x-apple-reminderkit://";

  generateRemindersTitle(stack, tasks.length);

  stack.addSpacer(8);

  tasks
    .splice(0, 5)
    .forEach((task) => generateRemindersEntry(stack, task.title));

  stack.addSpacer(4);
}

function generateRemindersTitle(stack, taskCount) {
  const titleStack = stack.addStack();
  titleStack.bottomAlignContent();

  const countStack = titleStack.addStack();
  const count = countStack.addText(taskCount + "");
  count.font = Font.heavySystemFont(25);
  count.textColor = new Color(kDayColor);

  titleStack.addSpacer(2);

  const nameStack = titleStack.addStack();
  nameStack.layoutVertically();
  const title = nameStack.addText("REMINDERS");
  title.font = Font.boldMonospacedSystemFont(15);
  title.textColor = new Color(kMainBackgroundColor);
  nameStack.addSpacer(3);

  titleStack.addSpacer();
}

function generateRemindersEntry(stack, reminder) {
  const entryStack = stack.addStack();
  entryStack.layoutVertically();
  entryStack.setPadding(0, 0, 0, 5);
  const entryText = entryStack.addText(reminder);
  entryText.textColor = new Color(kCalendarBackgroundColor);
  entryText.font = Font.semiboldSystemFont(12);
  entryText.lineLimit = 1;

  stack.addSpacer(6);
}
