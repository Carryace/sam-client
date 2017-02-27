import * as _ from 'lodash';

import { Component, DoCheck, Input, KeyValueDiffers, NgZone, OnInit, OnChanges, QueryList, SimpleChange, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { FHService, IAMService } from 'api-kit';
import { Validators as $Validators } from '../../shared/validators';

import { User } from '../user.interface';
import { KBA } from '../kba.interface';

@Component({
  templateUrl: './details.component.html',
  providers: [
    FHService,
    IAMService
  ]
})
export class DetailsComponent {
  @ViewChild('confirmModal') confirmModal;
  @ViewChild('reconfirmModal') reconfirmModal;
  @ViewChildren('kba') kbaEntries;

  private differ;
  private api = {
    fh: null,
    iam: null
  };

  private lookups = {
    questions: [
      { 'id': 1,  'question': 'What was the make and model of your first car?' },
      { 'id': 2,  'question': 'Who is your favorite Actor/Actress?' },
      { 'id': 3,  'question': 'What was your high school mascot?' },
      { 'id': 4,  'question': 'When you were young, what did you want to be when you grew up?' },
      { 'id': 5,  'question': 'Where were you when you first heard about 9/11?' },
      { 'id': 6,  'question': 'Where did you spend New Years Eve 2000?' },
      { 'id': 7,  'question': 'Who was your childhood hero?' },
      { 'id': 8,  'question': 'What is your favorite vacation spot?' },
      { 'id': 9,  'question': 'What is the last name of your first grade teacher?' },
      { 'id': 10, 'question': 'What is your dream job?' },
      { 'id': 11, 'question': 'If you won the Lotto, what is the first thing you would do?' },
      { 'id': 12, 'question': 'What is the title of your favorite book?' }
    ],

    indexes: {}
  };

  private states = {
    isGov: false,
    selected: ['','',''],
    submitted: false,
    editable: {
      identity: false,
      business: false,
      kba: false
    }
  };

  private user = {
    _id: '',
    email: '',

    title: '',

    fullName: '',
    firstName: '',
    initials: '',
    lastName: '',

    suffix: '',

    department: '',
    orgID: '',

    workPhone: '',

    kbaAnswerList: [],

    accountClaimed: true
  };

  private questions = [];

  private department = '';
  private agency = '';
  private office = '';
  private aac = '';

  public detailsForm: FormGroup;

  constructor(
    private router: Router,
    private builder: FormBuilder,
    private differs: KeyValueDiffers,
    private zone: NgZone,
    private _fh: FHService,
    private _iam: IAMService) {
      this.differ = differs.find({}).create(null);

      this.api.iam = _iam.iam;
      this.api.fh = _fh;
    }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.initUser(() => {
        this.zone.run(() => {
          let intAnswer;

          for(intAnswer = 0; intAnswer < this.user.kbaAnswerList.length; intAnswer++) {
            this.user.kbaAnswerList[intAnswer].answer = this.repeater(this.user.kbaAnswerList[intAnswer].answer, 8);
          }

          this.detailsForm = this.builder.group({
            title:           [this.user.title],

            firstName:       [this.user.firstName, Validators.required],
            initials:        [this.user.initials],
            middleName:      [this.user.initials],
            lastName:        [this.user.lastName, Validators.required],

            suffix:          [this.user.suffix],

            workPhone:       [this.user.workPhone],

            department:      [this.user.department],
            orgID:           [this.user.orgID],

            kbaAnswerList:   this.builder.array(
              this.user.kbaAnswerList.length ? [
                this.initKBAGroup(0),
                this.initKBAGroup(1),
                this.initKBAGroup(2)
              ] : []
            ),
          });

          if(this.states.isGov) {
            this.api.fh
              .getOrganizationById(this.user.orgID)
              .subscribe(data => {
                let organization = data['_embedded'][0]['org'];

                this.department = (organization.l1Name || '');
                this.agency = (organization.l2Name || '');
                this.office = (organization.l3Name || '');

                this.aac = (organization.code || '');
              });
          }
        });
      });
    });
  }

  ngDoCheck() {
    let vm = this,
        changes = this.differ.diff(this.user),
        key;

    if(changes) {
      changes.forEachChangedItem((diff) => {
        if(vm.detailsForm && vm.detailsForm.controls[diff.key]) {
          key = diff.key.toString().search(/(middleName|initials)/) > -1 ? 'initials' : diff.key;

          vm.detailsForm.controls[key].setValue(diff.currentValue);
          vm.user[key] = diff.currentValue;
        }
      });
    }
  }

  loadUser(cb) {
    let vm = this;

    this.api.iam.checkSession(function(user) {
      vm.user = _.merge({}, vm.user, user);
      vm.user['middleName'] = user.initials;
      cb();
    }, function() {
      vm.router.navigate(['/signin']);
    });
  }

  loadKBA(cb) {
    let vm = this;

    function processKBAQuestions(data) {
      let questions,
          selected,
          intQuestion,
          intAnswer;

      // Prepopulate kbaAnswerList
      for(intAnswer = 0; intAnswer < data.selected.length; intAnswer++) {
        vm.user.kbaAnswerList.push({ questionId: 0, answer: ' ' });
      }

      // Set Selected Answers
      vm.user.kbaAnswerList = vm.user.kbaAnswerList.map(function(answer, intAnswer) {
        selected = (data.selected[intAnswer] || -1);

        answer.questionId = selected;
        vm.states.selected[intAnswer] = selected;

        return answer;
      });

      // Set question mapping of questionID => index
      vm.lookups.questions = data.questions;
      vm.lookups.questions = vm.lookups.questions.map(function(question, intQuestion) {
        // Create reverse lookup while remapping
        vm.lookups.indexes[question.id] = intQuestion;
        question['disabled'] = false;
        return question;
      });

      for(intQuestion in vm.user.kbaAnswerList) {
        intQuestion = parseInt(intQuestion);

        questions = _.cloneDeep(vm.lookups.questions).map(function(question, index) {
          intAnswer = _.indexOf(data.selected, question.id);
          // Update disabled state
          question.disabled = (intAnswer > -1) && (intAnswer !== intQuestion);

          return question;
        });

        vm.questions.push(questions);
      }

      cb();
    }

    function cancelKBAQuestions(error) {
      cb();
    }

    this.api.iam.kba.questions(processKBAQuestions, cancelKBAQuestions);
  }

  initUser(cb) {
    let vm = this,
        fn,
        getSessionUser = (function(promise) {
          this.zone.runOutsideAngular(() => {
            this.loadUser(() => {
              this.zone.run(() => {
                this.states.isGov = _.isUndefined(this.user.department) && String(this.user.department).length;
                this.loadKBA(() => {
                  promise(this.user);
                });
              });
            });
          });
        }).bind(this),

        getMockUser = (function(promise) {
          let intQuestion;

          vm.states.isGov = true;

          for(intQuestion in vm.user.kbaAnswerList) {
            vm.questions.push(vm.lookups.questions);
          }

          vm.lookups.questions = vm.lookups.questions.map(function(question, intQuestion) {
            // Create reverse lookup while remapping
            vm.lookups.indexes[question.id] = intQuestion;
            question['disabled'] = false;
            return question;
          });

          promise({
            email: 'doe.john@gsa.gov',
            suffix: '',
            firstName: 'John',
            initials: 'J',
            middleName: 'J',
            lastName: 'Doe',

            department: 100006688,
            orgID: 100173623,

            workPhone: '2401234568',

            kbaAnswerList: [
              { questionId: 1, answer: '' },
              { questionId: 3, answer: '' },
              { questionId: 5, answer: '' }
            ]
          });
        }).bind(this);

    fn = this.api.iam.isDebug() ? getMockUser : getSessionUser;

    fn((userData) => {
      vm.user = _.merge({}, vm.user, userData);
      cb();
    });
  }

  initKBAGroup($index) {
    let kbaAnswer = this.user.kbaAnswerList[$index];

    return this.builder.group({
      questionId: [kbaAnswer.questionId, Validators.required],
      answer:     [kbaAnswer.answer, [Validators.required, Validators.minLength(8), $Validators.unique('answer')]]
    })
  }

  repeater(string, iterations) {
    let repeater = '';

    if(string.length && iterations) {
      while(iterations--) {
        repeater += string;
      }
    }

    return repeater;
  }

  get phone():string {
    let phone = this.user.workPhone
      .replace(/[^0-9]/g, '')
      .replace(/([0-9]{1})([0-9]{3})([0-9]{3})([0-9]{4})/g, '$1+($2) $3-$4');

    switch(phone.length) {
      case 14:
        phone = `1+${phone}`;
        break;
    }

    return phone;
  }

  updatePhoneNumber(phoneNumber) {
    this.user.workPhone = phoneNumber;
  }

  setDepartment(department) {
    this.user.department = department.value;
  }

  setOrganization(organization) {
    this.user.orgID = organization.value;
  }

  get name():string {
    return [
      this.user.firstName || '',
      this.user.initials || '',
      this.user.lastName || ''
    ].join(' ').replace(/\s+/g, ' ');
  }

  isEdit(groupKey) {
    return this.states.editable[groupKey] || false;
  }

  /**
   * KBA
   */
  getHashedAnswer(answer) {
    return (answer.length ? answer : this.repeater(' ', 8)).replace(/./g, '&bull;');
  }

  question(questionID) {
    const questions = this.lookups.questions,
          mappings = this.lookups.indexes;
    return questions[mappings[questionID]].question;
  }

  changeQuestion(questionID, $index) {
    let vm = this,
        items = _.cloneDeep(this.lookups.questions),
        intQuestion;

    this.states.selected[$index] = questionID;

    this.states.selected.forEach(function(questionID, intItem) {
      if(questionID.toString().length) {
        intQuestion = vm.lookups.indexes[questionID];
        // Loop through new questions array lookup to apply disabled options
        items[intQuestion].disabled = true;
      }
    });

    this.states.selected.forEach(function(questionID, intItem) {
      // Loop through each question list to set the list to the new questions list
      vm.questions[intItem] = _.cloneDeep(items);
      // Re-enable the selected option
      if(questionID) {
        intQuestion = vm.lookups.indexes[questionID];
        vm.questions[intItem][intQuestion].disabled = false;
      }
    });
  }

  /**
   * Account Deactivation
   */
  confirmDeactivation() {
    this.confirmModal.openModal();
  }

  reconfirmDeactivation() {
    this.confirmModal.closeModal();
    this.reconfirmModal.openModal();
  }

  deactivateAccount(cb) {
    this.api.iam.user.deactivate(this.user.email, function() {
      cb();
    }, function() {
      //TODO
    });
  }

  deactivate() {
    this.zone.runOutsideAngular(() => {
      this.deactivateAccount(() => {
        this.zone.run(() => {
          // Close reconfirm prompt
          this.reconfirmModal.closeModal();
          // Sign user out
          this.api.iam.logout();
          // Redirect to login
          this.router
            .navigate(['signin'])
            .then(function() {
              window.location.reload();
            });
        });
      });
    });
  }

  /**
   * Editables
   */
  edit(groupKey) {
    this.states.editable[groupKey] = true;
  }

  isValid(keys: Array<String>) {
    let controls = this.detailsForm.controls,
        entries = this.kbaEntries.toArray(),
        valid = true,
        key,
        intKey,
        intArrayKey;

    for(intKey = 0; intKey < entries.length; intKey++) {
      entries[intKey].updateState(true);
    }

    for(intKey = 0; intKey < keys.length; intKey++) {
      key = keys[intKey];

      controls[key].markAsDirty();

      if(controls[key].invalid) {
        valid = false;
        return valid
      }
    }

    return valid;
  }

  saveGroup(keys: Array<String>, cb) {
    let controls = this.detailsForm.controls,
        userData = {
          fullName: this.name
        },

        key,
        controlValue,
        intKey;

    for(intKey = 0; intKey < keys.length; intKey++) {
      key = keys[intKey];
      controlValue = controls[key].value;

      if(controlValue.toString().length) {
        userData[key] = controlValue;
      }

      if(key == 'workPhone') {
        userData[key] = this.user.workPhone;
      }

      if(key == 'kbaAnswerList') {
        userData[key] = controlValue.map((item, intItem) => {
          item.answer = item.answer.trim();
          this.user.kbaAnswerList[intItem] = item;

          return item;
        });

        this.api.iam.kba.update(userData[key], () => {
          console.log('KBA Q&A successfully saved');
          cb();
        }, () => {
          cb();
        });

        return;
      }
    }

    this.api.iam.user.update(userData, (data) => {
      cb();
    }, () => {
      cb();
    });
  }

  save(groupKey) {
    let controls = this.detailsForm.controls,
        mappings = {
          'identity': 'title|firstName|initials|lastName|suffix',
          'business': 'department|orgID|workPhone',
          'kba': 'kbaAnswerList'
        },

        keys = mappings[groupKey].split('|'),
        valid = this.isValid(keys);

    if(valid) {
      this.states.submitted = true;

      this.zone.runOutsideAngular(() => {
        this.saveGroup(keys, () => {
          this.zone.run(() => {
            this.states.editable[groupKey] = false;
            this.states.submitted = false;
          });
        });
      });
    }
  }
};
