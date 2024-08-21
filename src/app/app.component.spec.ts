import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [AppComponent],
            providers: [
                provideNoopAnimations()
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should update exchange rate every 3 seconds', fakeAsync(() => {
        spyOn(component, 'getRandomNumber').and.returnValue(0.03);
        component.updateExchangeRate();
        tick(3000);
        expect(component.reelExchangeRateEuroDollar()).toBe(1.13);
        component.ngOnDestroy();
        discardPeriodicTasks();
    }));

    it('should perform conversion from EUR to USD', () => {
        component.euro1.set(100);
        expect(component.dollar1()).toBe(110);
    });

    it('should switch order and recalculate the conversion', () => {
        component.euro1.set(100);
        expect(component.dollar1()).toBe(110);
        component.switchCurrency();
        expect(component.euroToDollar()).toBe(false);
        expect(component.dollar2()).toBe(110);
        expect(component.reelExchangeRateDollarEuro()).toBe(0.91);
        expect(component.euro2()).toBe(100.1);
    });

    it('should disable fixed exchange rate if variation exceeds 2%', fakeAsync(() => {
        component.isFixedRate.set(true);
        component.fixedExchangeRateEuroDollar.set(1.12);
        spyOn(component, 'getRandomNumber').and.returnValues(0.01, -0.03);
        component.updateExchangeRate();
        tick(3000);
        expect(component.isFixedRate()).toBeTrue();
        component.updateExchangeRate();
        tick(3000);
        expect(component.isFixedRate()).toBeFalse();
        component.ngOnDestroy();
        discardPeriodicTasks();
    }));

});
