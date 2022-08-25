radio.onReceivedValue(function on_received_value(name: string, value: number) {
    
    if (!Controller) {
        if (name == "x") {
            if (lastx != value) {
                lastx = value
                update = true
            }
            
        } else if (name == "y") {
            if (lasty != value) {
                lasty = value
                update = true
            }
            
        } else if (name == "s") {
            lastx = 512
            lasty = 512
            if (value == 1) {
                stop = true
            } else {
                stop = false
            }
            
            update = true
        }
        
    }
    
})
let motorp = 0
let stop = false
let lasty = 0
let update = false
let lastx = 0
let lastinter = 0
let bright = 0
let lmotor = 0
let rmotor = 0
let Controller = false
let lastxround = 2
let lastyround = 2
radio.setGroup(40)
radio.setTransmitPower(7)
radio.setTransmitSerialNumber(false)
Controller = false
if (!Controller) {
    pins.digitalWritePin(DigitalPin.P0, 0)
    pins.analogWritePin(AnalogPin.P1, 0)
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.analogWritePin(AnalogPin.P8, 0)
    rmotor = 0
    lmotor = 0
} else {
    bright = 0
    lastinter = 0
}

basic.forever(function on_forever() {
    let motorb: number;
    let motorbmax: number;
    let motorr: number;
    let motorl: number;
    
    if (Controller) {
        if (pins.digitalReadPin(DigitalPin.P8) == 0 && !stop) {
            radio.sendValue("s", 1)
            stop = true
            basic.clearScreen()
            basic.showLeds(`
                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
            `)
        } else if (pins.digitalReadPin(DigitalPin.P8) == 1 && stop) {
            radio.sendValue("s", 0)
            stop = false
            basic.clearScreen()
            bright = 255
            led.plotBrightness(2, 2, 255)
        } else if (stop) {
            basic.showLeds(`
                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
            `)
        }
        
        if (!(Math.round(lastx / 256) == Math.round(pins.analogReadPin(AnalogPin.P1) / 256) && Math.round(lasty / 256) == Math.round(pins.analogReadPin(AnalogPin.P2) / 256))) {
            lastinter = 40
        }
        
        if (lastinter > 0 && !(lastx == pins.analogReadPin(AnalogPin.P1) && lasty == pins.analogReadPin(AnalogPin.P2))) {
            lastinter += 0 - 1
            if (bright < 255) {
                bright += 15
                if (bright > 255) {
                    bright = 255
                }
                
            }
            
            led.unplot(Math.round(lastx / 256), 4 - Math.round(lasty / 256))
            lastx = pins.analogReadPin(AnalogPin.P1)
            lasty = pins.analogReadPin(AnalogPin.P2)
            led.plotBrightness(Math.round(lastx / 256), 4 - Math.round(lasty / 256), bright)
            radio.sendValue("x", lastx)
            radio.sendValue("y", lasty)
        } else if (bright > 0) {
            bright += -5
            if (bright < 0) {
                bright = 0
            }
            
            basic.clearScreen()
            led.plotBrightness(Math.round(lastx / 256), 4 - Math.round(lasty / 256), bright)
        }
        
    } else if (update) {
        lastinter = 40
        update = false
        lastxround = Math.round(lastx / 256)
        lastyround = Math.round(lasty / 256)
        basic.clearScreen()
        led.plotBrightness(lastxround, 4 - lastyround, bright)
        if (lastxround == 2 && lastyround == 2) {
            rmotor = 0
            lmotor = 0
        } else if (lastxround == 2 && lastyround > 2) {
            rmotor = 1
            lmotor = 1
        } else if (lastxround == 2 && lastyround < 2) {
            rmotor = -1
            lmotor = -1
        } else if (lastxround > 2 && lastyround == 2) {
            rmotor = 1
            lmotor = -1
        } else if (lastxround < 2 && lastyround == 2) {
            rmotor = -1
            lmotor = 1
        } else if (lastxround > 2 && lastyround > 2) {
            rmotor = 1
            lmotor = 0
        } else if (lastxround > 2 && lastyround < 2) {
            rmotor = 0
            lmotor = 1
        } else if (lastxround < 2 && lastyround > 2) {
            rmotor = -1
            lmotor = 0
        } else if (lastxround < 2 && lastyround < 2) {
            rmotor = 0
            lmotor = -1
        }
        
        lastx = Math.abs(lastx - 512)
        lasty = Math.abs(lasty - 512)
        motorp = Math.sqrt(lastx ** 2 + lasty ** 2)
        if (lastx >= lasty) {
            motorb = Math.acos(lasty / motorp)
        } else {
            motorb = Math.acos(lastx / motorp)
        }
        
        motorbmax = 512 / Math.sin(motorb)
        motorr = Math.sin(motorb)
        motorl = Math.sqrt(1 - motorr ** 2)
        motorp = Math.round(motorp / motorbmax * 1024)
        if (motorp > 1023) {
            motorp = 1023
        }
        
        if (rmotor == -1) {
            pins.analogWritePin(AnalogPin.P0, motorp * motorr)
            pins.digitalWritePin(DigitalPin.P1, 0)
        } else if (rmotor == 0) {
            pins.digitalWritePin(DigitalPin.P0, 0)
            pins.analogWritePin(AnalogPin.P1, 0)
        } else if (rmotor == 1) {
            pins.digitalWritePin(DigitalPin.P0, 0)
            pins.analogWritePin(AnalogPin.P1, motorp * motorr)
        }
        
        if (lmotor == -1) {
            pins.analogWritePin(AnalogPin.P8, motorp * motorl)
            pins.digitalWritePin(DigitalPin.P2, 0)
        } else if (lmotor == 0) {
            pins.digitalWritePin(DigitalPin.P8, 0)
            pins.analogWritePin(AnalogPin.P2, 0)
        } else if (lmotor == 1) {
            pins.digitalWritePin(DigitalPin.P8, 0)
            pins.analogWritePin(AnalogPin.P2, motorp * motorl)
        }
        
        if (stop) {
            pins.digitalWritePin(DigitalPin.P0, 1)
            pins.digitalWritePin(DigitalPin.P1, 1)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P2, 1)
            basic.clearScreen()
            basic.showLeds(`
                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
                                # # # # #
            `)
        }
        
    } else if (lastinter > 0) {
        lastinter += 0 - 1
        if (bright < 255) {
            bright += 15
            if (bright > 255) {
                bright = 255
            }
            
            basic.clearScreen()
            led.plotBrightness(lastxround, 4 - lastyround, bright)
        }
        
    } else {
        if (bright > 4) {
            bright += -5
        } else {
            bright = 0
        }
        
        basic.clearScreen()
        led.plotBrightness(lastxround, 4 - lastyround, bright)
    }
    
})
