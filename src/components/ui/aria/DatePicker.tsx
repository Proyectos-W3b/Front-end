import {
  DatePicker as AriaDatePicker, DateInput, DateSegment, Group, Label, Popover, Dialog,
  Calendar, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, CalendarCell,
  Button, Heading, type DatePickerProps, type DateValue,
} from 'react-aria-components';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props<T extends DateValue> extends DatePickerProps<T> {
  label?: string;
}

export function DatePicker<T extends DateValue>({ label, className, ...props }: Props<T>) {
  return (
    <AriaDatePicker {...props} className={`flex flex-col ${className ?? ''}`}>
      {label && <Label className="label">{label}</Label>}
      <Group className="input flex items-center gap-2">
        <DateInput className="flex-1 flex">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 tabular-nums outline-none rounded text-slate-800 focus:bg-blue-100 data-[placeholder]:text-slate-400"
            />
          )}
        </DateInput>
        <Button className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 outline-none">
          <CalendarDays className="w-4 h-4" />
        </Button>
      </Group>

      <Popover className="z-[9999] bg-white rounded-xl border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.18)] p-3
        data-[entering]:animate-in data-[entering]:fade-in data-[entering]:zoom-in-95
        data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:zoom-out-95">
        <Dialog className="outline-none">
          <Calendar>
            <header className="flex items-center justify-between mb-3">
              <Button slot="previous" className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors outline-none">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Heading className="text-sm font-semibold text-slate-800" />
              <Button slot="next" className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors outline-none">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </header>
            <CalendarGrid className="border-collapse">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="w-8 h-8 text-[11px] font-medium text-slate-400">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className="w-8 h-8 text-center text-sm rounded-lg text-slate-700 outline-none cursor-pointer
                      data-[hovered]:bg-blue-50 data-[hovered]:text-blue-600
                      data-[selected]:bg-blue-600 data-[selected]:text-white data-[selected]:font-semibold
                      data-[outside-month]:text-slate-300
                      data-[disabled]:text-slate-200 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent"
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
