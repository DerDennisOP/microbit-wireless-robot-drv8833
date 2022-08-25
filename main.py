def on_received_value(name, value):
    global lastx, update, lasty, stop
    if not (Controller):
        if name == "x":
            if lastx != value:
                lastx = value
                update = True
        elif name == "y":
            if lasty != value:
                lasty = value
                update = True
        elif name == "s":
            lastx = 512
            lasty = 512
            if value == 1:
                stop = True
            else:
                stop = False
            update = True
radio.on_received_value(on_received_value)

motorp = 0
stop = False
lasty = 0
update = False
lastx = 0
lastinter = 0
bright = 0
lmotor = 0
rmotor = 0
Controller = False
lastxround = 2
lastyround = 2
radio.set_group(40)
radio.set_transmit_power(7)
radio.set_transmit_serial_number(False)
Controller = False
if not (Controller):
    pins.digital_write_pin(DigitalPin.P0, 0)
    pins.analog_write_pin(AnalogPin.P1, 0)
    pins.digital_write_pin(DigitalPin.P2, 0)
    pins.analog_write_pin(AnalogPin.P8, 0)
    rmotor = 0
    lmotor = 0
else:
    bright = 0
    lastinter = 0

def on_forever():
    global stop, bright, lastinter, lastx, lasty, update, lastxround, lastyround, rmotor, lmotor, motorp
    if Controller:
        if pins.digital_read_pin(DigitalPin.P8) == 0 and not (stop):
            radio.send_value("s", 1)
            stop = True
            basic.clear_screen()
            basic.show_leds("""
                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
            """)
        elif pins.digital_read_pin(DigitalPin.P8) == 1 and stop:
            radio.send_value("s", 0)
            stop = False
            basic.clear_screen()
            bright = 255
            led.plot_brightness(2, 2, 255)
        elif stop:
            basic.show_leds("""
                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
            """)
        if not (Math.round(lastx / 256) == Math.round(pins.analog_read_pin(AnalogPin.P1) / 256) and Math.round(lasty / 256) == Math.round(pins.analog_read_pin(AnalogPin.P2) / 256)):
            lastinter = 40
        if lastinter > 0 and not (lastx == pins.analog_read_pin(AnalogPin.P1) and lasty == pins.analog_read_pin(AnalogPin.P2)):
            lastinter += 0 - 1
            if bright < 255:
                bright += 15
                if bright > 255:
                    bright = 255
            led.unplot(Math.round(lastx / 256), 4 - Math.round(lasty / 256))
            lastx = pins.analog_read_pin(AnalogPin.P1)
            lasty = pins.analog_read_pin(AnalogPin.P2)
            led.plot_brightness(Math.round(lastx / 256), 4 - Math.round(lasty / 256), bright)
            radio.send_value("x", lastx)
            radio.send_value("y", lasty)
        elif bright > 0:
            bright += -5
            if bright < 0:
                bright = 0
            basic.clear_screen()
            led.plot_brightness(Math.round(lastx / 256), 4 - Math.round(lasty / 256), bright)
    elif update:
        lastinter = 40
        update = False
        lastxround = Math.round(lastx / 256)
        lastyround = Math.round(lasty / 256)
        basic.clear_screen()
        led.plot_brightness(lastxround, 4 - lastyround, bright)
        if lastxround == 2 and lastyround == 2:
            rmotor = 0
            lmotor = 0
        elif lastxround == 2 and lastyround > 2:
            rmotor = 1
            lmotor = 1
        elif lastxround == 2 and lastyround < 2:
            rmotor = -1
            lmotor = -1
        elif lastxround > 2 and lastyround == 2:
            rmotor = 1
            lmotor = -1
        elif lastxround < 2 and lastyround == 2:
            rmotor = -1
            lmotor = 1
        elif lastxround > 2 and lastyround > 2:
            rmotor = 1
            lmotor = 0
        elif lastxround > 2 and lastyround < 2:
            rmotor = 0
            lmotor = 1
        elif lastxround < 2 and lastyround > 2:
            rmotor = -1
            lmotor = 0
        elif lastxround < 2 and lastyround < 2:
            rmotor = 0
            lmotor = -1
        lastx = abs(lastx - 512)
        lasty = abs(lasty - 512)
        motorp = Math.sqrt(lastx ** 2 + lasty ** 2)
        if lastx >= lasty:
            motorb = Math.acos(lasty / motorp)
        else:
            motorb = Math.acos(lastx / motorp)
        motorbmax = 512 / Math.sin(motorb)
        motorp = Math.round(motorp / motorbmax * 1024)
        if motorp > 1023:
            motorp = 1023
        if rmotor == -1:
            pins.analog_write_pin(AnalogPin.P0, motorp)
            pins.digital_write_pin(DigitalPin.P1, 0)
        elif rmotor == 0:
            pins.digital_write_pin(DigitalPin.P0, 0)
            pins.analog_write_pin(AnalogPin.P1, 0)
        elif rmotor == 1:
            pins.digital_write_pin(DigitalPin.P0, 0)
            pins.analog_write_pin(AnalogPin.P1, motorp)
        if lmotor == -1:
            pins.analog_write_pin(AnalogPin.P8, motorp)
            pins.digital_write_pin(DigitalPin.P2, 0)
        elif lmotor == 0:
            pins.digital_write_pin(DigitalPin.P8, 0)
            pins.analog_write_pin(AnalogPin.P2, 0)
        elif lmotor == 1:
            pins.digital_write_pin(DigitalPin.P8, 0)
            pins.analog_write_pin(AnalogPin.P2, motorp)
        if stop:
            pins.digital_write_pin(DigitalPin.P0, 1)
            pins.digital_write_pin(DigitalPin.P1, 1)
            pins.digital_write_pin(DigitalPin.P8, 1)
            pins.digital_write_pin(DigitalPin.P2, 1)
            basic.clear_screen()
            basic.show_leds("""
                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
            """)
    elif lastinter > 0:
        lastinter += 0 - 1
        if bright < 255:
            bright += 15
            if bright > 255:
                bright = 255
            basic.clear_screen()
            led.plot_brightness(lastxround, 4 - lastyround, bright)
    else:
        if bright > 4:
            bright += -5
        else:
            bright = 0
        basic.clear_screen()
        led.plot_brightness(lastxround, 4 - lastyround, bright)
basic.forever(on_forever)
