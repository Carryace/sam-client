import { Http, BaseRequestOptions, RequestMethod } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import {SystemAlertsService} from "./system-alerts.service";
import {TestBed, fakeAsync, inject} from "@angular/core/testing";
import {WrapperService} from "../wrapper/wrapper.service";

describe('SystemAlertsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemAlertsService,
        WrapperService,
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions],
        },
      ],
    });
  });

  it('should provide default parameters and hit the alert endpoint', inject([SystemAlertsService, MockBackend], fakeAsync((service: SystemAlertsService, backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.method).toBe(RequestMethod.Get);
      expect(connection.request.url).toMatch(/alerts/);
    });
    service.getActive();
  })));

  it('should allow parameters to be passed in', inject([SystemAlertsService, MockBackend], fakeAsync((service: SystemAlertsService, backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.method).toBe(RequestMethod.Get);
      expect(connection.request.url).toMatch(/allAlerts/);
    });
    service.getAll(5, 5, ['y', 'n'], ['warning', 'error'], "1d", "published", 'asc');
  })));

  it('should update an alert', inject([SystemAlertsService, MockBackend], fakeAsync((service: SystemAlertsService, backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.method).toBe(RequestMethod.Put);
      expect(connection.request.url).toMatch(/alerts/);
    });
    service.updateAlert(1, true, 'SEVERE', '1/2/16', '1/2/3');
  })));

  it('should create an alert', inject([SystemAlertsService, MockBackend], fakeAsync((service: SystemAlertsService, backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.method).toBe(RequestMethod.Post);
      expect(connection.request.url).toMatch(/alerts/);
    });
    service.createAlert(true, 'SEVERE', '1/2/16', '1/2/3');
  })));

  it('should delete an alert', inject([SystemAlertsService, MockBackend], fakeAsync((service: SystemAlertsService, backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.method).toBe(RequestMethod.Delete);
      expect(connection.request.url).toMatch(/alerts/);
    });
    service.deleteAlert(1);
  })));
});
