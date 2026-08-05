import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { sessionInactiveGuard } from './session-inactive-guard';

describe('sessionInactiveGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => sessionInactiveGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
